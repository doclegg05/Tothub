import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { db } from "../db";
import { billing, children } from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

const router = Router();

// Get billing records
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { childId } = req.query;
    
    let query = db
      .select({
        billing: billing,
        childName: sql`${children.firstName} || ' ' || ${children.lastName}`,
      })
      .from(billing)
      .innerJoin(children, eq(billing.childId, children.id))
      .orderBy(desc(billing.createdAt));
    
    if (childId) {
      query = query.where(eq(billing.childId, childId as string));
    }
    
    const invoices = await query;
    
    // Calculate totals
    const outstanding = invoices
      .filter((inv: any) => inv.billing.status === 'pending' || inv.billing.status === 'overdue')
      .reduce((sum: number, inv: any) => sum + (inv.billing.totalAmount || 0), 0);
    
    const thisMonth = invoices
      .filter((inv: any) => {
        const invoiceDate = new Date(inv.billing.createdAt);
        const now = new Date();
        return invoiceDate.getMonth() === now.getMonth() && 
               invoiceDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, inv: any) => sum + (inv.billing.totalAmount || 0), 0);
    
    const yearToDate = invoices
      .filter((inv: any) => {
        const invoiceDate = new Date(inv.billing.createdAt);
        const now = new Date();
        return invoiceDate.getFullYear() === now.getFullYear() &&
               inv.billing.status === 'paid';
      })
      .reduce((sum: number, inv: any) => sum + (inv.billing.totalAmount || 0), 0);
    
    res.json({
      invoices,
      outstanding: (outstanding / 100).toFixed(2),
      thisMonth: (thisMonth / 100).toFixed(2),
      yearToDate: (yearToDate / 100).toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching billing records:", error);
    res.status(500).json({ message: "Failed to fetch billing records" });
  }
});

// Create a billing record
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { childId, periodStart, periodEnd, attendanceDays, tuitionAmount, extraFees, dueDate } = req.body;
    
    const totalAmount = tuitionAmount + (extraFees || 0);
    
    const [newBilling] = await db
      .insert(billing)
      .values({
        childId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        attendanceDays,
        tuitionAmount,
        extraFees: extraFees || 0,
        totalAmount,
        dueDate: new Date(dueDate),
        status: 'pending',
      })
      .returning();
    
    res.json(newBilling);
  } catch (error) {
    console.error("Error creating billing record:", error);
    res.status(500).json({ message: "Failed to create billing record" });
  }
});

// Update billing status
router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, quickbooksId } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (quickbooksId) updateData.quickbooksId = quickbooksId;
    
    const [updated] = await db
      .update(billing)
      .set(updateData)
      .where(eq(billing.id, id))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating billing record:", error);
    res.status(500).json({ message: "Failed to update billing record" });
  }
});

export default router;