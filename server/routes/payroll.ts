import { Router } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../db";
import {
  staff,
  timesheetEntries,
  payPeriods,
  payStubs,
  payrollReports,
  payrollAudit,
  insertTimesheetEntrySchema,
  insertPayPeriodSchema,
  insertPayStubSchema,
  insertPayrollReportSchema
} from "@shared/schema";
import { PayrollCalculator } from "../services/payrollCalculator";
import { PayStubGenerator } from "../services/payStubGenerator";
import { z } from "zod";

const router = Router();

// Get all staff with payroll information
router.get("/staff", async (req, res) => {
  try {
    const staffWithPayroll = await db
      .select()
      .from(staff)
      .where(eq(staff.isActive, 1))
      .orderBy(staff.lastName);

    res.json(staffWithPayroll);
  } catch (error) {
    console.error("Error fetching payroll staff:", error);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

// Create timesheet entry
router.post("/timesheet", async (req, res) => {
  try {
    const data = insertTimesheetEntrySchema.parse(req.body);
    
    // Calculate hours if clock times are provided
    if (data.clockInTime && data.clockOutTime) {
      const clockIn = new Date(data.clockInTime);
      const clockOut = new Date(data.clockOutTime);
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      const adjustedMinutes = Math.max(0, totalMinutes - (data.breakMinutes || 0));
      
      const regularMinutes = Math.min(adjustedMinutes, 40 * 60); // 40 hours max
      const overtimeMinutes = Math.max(0, adjustedMinutes - (40 * 60));
      
      data.totalHours = adjustedMinutes;
    }
    
    const [timesheet] = await db
      .insert(timesheetEntries)
      .values(data)
      .returning();

    res.status(201).json(timesheet);
  } catch (error) {
    console.error("Error creating timesheet:", error);
    res.status(500).json({ message: "Failed to create timesheet entry" });
  }
});

// Get timesheet entries for a staff member
router.get("/timesheet/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate } = req.query;

    let query = db
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.staffId, staffId));

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(timesheetEntries.date, (startDate as string)),
          lte(timesheetEntries.date, (endDate as string))
        )
      );
    }

    const timesheets = await query.orderBy(desc(timesheetEntries.date));
    res.json(timesheets);
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    res.status(500).json({ message: "Failed to fetch timesheets" });
  }
});

// Create pay period
router.post("/pay-periods", async (req, res) => {
  try {
    const data = insertPayPeriodSchema.parse(req.body);
    
    const [payPeriod] = await db
      .insert(payPeriods)
      .values(data)
      .returning();

    res.status(201).json(payPeriod);
  } catch (error) {
    console.error("Error creating pay period:", error);
    res.status(500).json({ message: "Failed to create pay period" });
  }
});

// Get all pay periods
router.get("/pay-periods", async (req, res) => {
  try {
    const periods = await db
      .select()
      .from(payPeriods)
      .orderBy(desc(payPeriods.startDate));

    res.json(periods);
  } catch (error) {
    console.error("Error fetching pay periods:", error);
    res.status(500).json({ message: "Failed to fetch pay periods" });
  }
});

// Process payroll for a pay period
router.post("/pay-periods/:payPeriodId/process", async (req, res) => {
  try {
    const { payPeriodId } = req.params;
    const { processedBy } = req.body;

    // Get pay period details
    const [payPeriod] = await db
      .select()
      .from(payPeriods)
      .where(eq(payPeriods.id, payPeriodId));

    if (!payPeriod) {
      return res.status(404).json({ message: "Pay period not found" });
    }

    // Get all active staff
    const allStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.isActive, 1));

    const processedPayStubs = [];
    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalTaxes = 0;

    for (const employee of allStaff) {
      // Get timesheet entries for this pay period
      const timesheets = await db
        .select()
        .from(timesheetEntries)
        .where(
          and(
            eq(timesheetEntries.staffId, employee.id),
            gte(timesheetEntries.date, payPeriod.startDate),
            lte(timesheetEntries.date, payPeriod.endDate),
            eq(timesheetEntries.isApproved, 1)
          )
        );

      // Calculate payroll for this employee
      const payrollCalc = PayrollCalculator.calculatePayroll(
        employee,
        timesheets,
        payPeriod
      );

      // Create pay stub
      const [payStub] = await db
        .insert(payStubs)
        .values(payrollCalc)
        .returning();

      processedPayStubs.push({ ...payStub, staff: employee });

      totalGrossPay += payrollCalc.grossPay;
      totalNetPay += payrollCalc.netPay;
      totalTaxes += (payrollCalc.federalTax + payrollCalc.stateTax + 
                    payrollCalc.socialSecurityTax + payrollCalc.medicareTax);
    }

    // Update pay period status
    await db
      .update(payPeriods)
      .set({
        status: "processing",
        totalGrossPay,
        totalNetPay,
        totalTaxes,
        processedBy,
        processedAt: new Date()
      })
      .where(eq(payPeriods.id, payPeriodId));

    res.json({
      message: "Payroll processed successfully",
      payStubs: processedPayStubs,
      totals: { totalGrossPay, totalNetPay, totalTaxes }
    });
  } catch (error) {
    console.error("Error processing payroll:", error);
    res.status(500).json({ message: "Failed to process payroll" });
  }
});

// Get pay stubs for a pay period
router.get("/pay-periods/:payPeriodId/pay-stubs", async (req, res) => {
  try {
    const { payPeriodId } = req.params;

    const payStubsWithStaff = await db
      .select({
        payStub: payStubs,
        staff: staff
      })
      .from(payStubs)
      .innerJoin(staff, eq(payStubs.staffId, staff.id))
      .where(eq(payStubs.payPeriodId, payPeriodId));

    res.json(payStubsWithStaff);
  } catch (error) {
    console.error("Error fetching pay stubs:", error);
    res.status(500).json({ message: "Failed to fetch pay stubs" });
  }
});

// Generate pay stub PDF
router.get("/pay-stubs/:payStubId/pdf", async (req, res) => {
  try {
    const { payStubId } = req.params;

    // Get pay stub with related data
    const [payStubData] = await db
      .select({
        payStub: payStubs,
        staff: staff,
        payPeriod: payPeriods
      })
      .from(payStubs)
      .innerJoin(staff, eq(payStubs.staffId, staff.id))
      .innerJoin(payPeriods, eq(payStubs.payPeriodId, payPeriods.id))
      .where(eq(payStubs.id, payStubId));

    if (!payStubData) {
      return res.status(404).json({ message: "Pay stub not found" });
    }

    // Get year-to-date totals
    const currentYear = new Date().getFullYear();
    const ytdStubs = await db
      .select()
      .from(payStubs)
      .where(eq(payStubs.staffId, payStubData.staff.id));

    const yearToDate = PayrollCalculator.calculateYearToDate(ytdStubs, currentYear);

    // Generate PDF
    const pdfBuffer = PayStubGenerator.generatePayStub({
      ...payStubData.payStub,
      staff: payStubData.staff,
      payPeriod: payStubData.payPeriod,
      yearToDate
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="paystub-${payStubData.staff.firstName}-${payStubData.staff.lastName}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating pay stub PDF:", error);
    res.status(500).json({ message: "Failed to generate pay stub PDF" });
  }
});

// Generate payroll summary report
router.get("/pay-periods/:payPeriodId/summary-report", async (req, res) => {
  try {
    const { payPeriodId } = req.params;

    // Get pay period
    const [payPeriod] = await db
      .select()
      .from(payPeriods)
      .where(eq(payPeriods.id, payPeriodId));

    if (!payPeriod) {
      return res.status(404).json({ message: "Pay period not found" });
    }

    // Get all pay stubs for this period
    const payStubsWithStaff = await db
      .select({
        payStub: payStubs,
        staff: staff
      })
      .from(payStubs)
      .innerJoin(staff, eq(payStubs.staffId, staff.id))
      .where(eq(payStubs.payPeriodId, payPeriodId));

    const payStubData = payStubsWithStaff.map(item => ({
      ...item.payStub,
      staff: item.staff,
      payPeriod: payPeriod
    }));

    // Generate summary PDF
    const pdfBuffer = PayStubGenerator.generatePayrollSummary(payStubData, payPeriod);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payroll-summary-${payPeriod.startDate}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating payroll summary:", error);
    res.status(500).json({ message: "Failed to generate payroll summary" });
  }
});

// Get payroll dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Get current pay period
    const [currentPayPeriod] = await db
      .select()
      .from(payPeriods)
      .where(eq(payPeriods.status, "open"))
      .orderBy(desc(payPeriods.startDate))
      .limit(1);

    // Get total employees
    const totalEmployees = await db
      .select({ count: staff.id })
      .from(staff)
      .where(eq(staff.isActive, 1));

    // Get year-to-date payroll totals
    const ytdPayStubs = await db
      .select()
      .from(payStubs)
      .innerJoin(payPeriods, eq(payStubs.payPeriodId, payPeriods.id));

    const ytdTotals = ytdPayStubs.reduce((totals, stub) => {
      const year = new Date(stub.pay_periods.startDate).getFullYear();
      if (year === currentYear) {
        totals.grossPay += stub.pay_stubs.grossPay;
        totals.netPay += stub.pay_stubs.netPay;
        totals.taxes += (stub.pay_stubs.federalTax + stub.pay_stubs.stateTax + 
                        stub.pay_stubs.socialSecurityTax + stub.pay_stubs.medicareTax);
      }
      return totals;
    }, { grossPay: 0, netPay: 0, taxes: 0 });

    // Get pending timesheets count
    const pendingTimesheets = await db
      .select({ count: timesheetEntries.id })
      .from(timesheetEntries)
      .where(eq(timesheetEntries.isApproved, 0));

    res.json({
      currentPayPeriod,
      totalEmployees: totalEmployees.length,
      ytdTotals,
      pendingTimesheets: pendingTimesheets.length
    });
  } catch (error) {
    console.error("Error fetching payroll dashboard:", error);
    res.status(500).json({ message: "Failed to fetch payroll dashboard data" });
  }
});

// Update staff payroll information
router.patch("/staff/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const updateData = req.body;

    // Validate that we're only updating payroll-related fields
    const allowedFields = [
      'hourlyRate', 'salaryAmount', 'payType', 'taxFilingStatus',
      'w4Allowances', 'additionalTaxWithholding', 'directDepositAccount',
      'directDepositRouting', 'employeeNumber'
    ];

    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    const [updatedStaff] = await db
      .update(staff)
      .set(filteredData)
      .where(eq(staff.id, staffId))
      .returning();

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(updatedStaff);
  } catch (error) {
    console.error("Error updating staff payroll info:", error);
    res.status(500).json({ message: "Failed to update staff payroll information" });
  }
});

export default router;