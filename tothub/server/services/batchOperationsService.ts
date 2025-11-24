import { db } from '../db';
import { children, attendance, staff, messages } from '@shared/schema';
import { sql, eq, and, inArray, gte } from 'drizzle-orm';
import { format } from 'date-fns';

export interface BatchCheckInData {
  childIds: string[];
  checkInTime: Date;
  notes?: string;
  mood?: string;
  authorizedBy: string;
}

export interface BatchMessageData {
  recipientType: 'parents' | 'staff' | 'specific';
  recipientIds?: string[];
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
}

export interface BatchInvoiceData {
  childIds: string[];
  period: 'weekly' | 'biweekly' | 'monthly';
  dueDate: Date;
  includeLateFees: boolean;
}

export interface BatchEnrollmentData {
  children: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    ageGroup: string;
    parentEmail: string;
    parentPhone: string;
    room?: string;
  }>;
  sendWelcomeEmail: boolean;
}

export class BatchOperationsService {
  // Batch check-in for field trips or morning arrivals
  static async batchCheckIn(data: BatchCheckInData): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const childId of data.childIds) {
      try {
        // Check if child is already checked in today
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.childId, childId),
              sql`DATE(${attendance.date}) = ${today}`
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(attendance).values({
            childId,
            date: new Date(),
            checkInTime: data.checkInTime,
            authorizedBy: data.authorizedBy,
            notes: data.notes,
            checkInMood: data.mood,
          });
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to check in child ${childId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  // Batch check-out
  static async batchCheckOut(childIds: string[], checkOutTime: Date, authorizedBy: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const today = format(new Date(), 'yyyy-MM-dd');

    for (const childId of childIds) {
      try {
        const result = await db
          .update(attendance)
          .set({
            checkOutTime: checkOutTime,
            authorizedPickup: authorizedBy,
          })
          .where(
            and(
              eq(attendance.childId, childId),
              sql`DATE(${attendance.date}) = ${today}`,
              sql`${attendance.checkOutTime} IS NULL`
            )
          );

        if (result.rowCount && result.rowCount > 0) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to check out child ${childId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  // Mass messaging
  static async sendBatchMessage(data: BatchMessageData): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    let recipientEmails: string[] = [];

    // Get recipient emails based on type
    if (data.recipientType === 'parents') {
      const activeChildren = await db
        .select({ parentEmail: children.parentEmail })
        .from(children)
        .where(eq(children.isActive, 1));
      
      recipientEmails = [...new Set(activeChildren.map((c: any) => c.parentEmail).filter(Boolean))] as string[];
    } else if (data.recipientType === 'staff') {
      const activeStaff = await db
        .select({ email: staff.email })
        .from(staff)
        .where(eq(staff.isActive, 1));
      
      recipientEmails = activeStaff.map((s: any) => s.email).filter(Boolean);
    } else if (data.recipientType === 'specific' && data.recipientIds) {
      // Get emails for specific recipients
      const specificChildren = await db
        .select({ parentEmail: children.parentEmail })
        .from(children)
        .where(inArray(children.id, data.recipientIds));
      
      recipientEmails = specificChildren.map((c: any) => c.parentEmail).filter(Boolean);
    }

    // Send messages
    for (const email of recipientEmails) {
      try {
        await db.insert(messages).values({
          senderId: 'system',
          receiverId: email,
          content: `${data.subject}\n\n${data.message}`,
          isRead: false,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send message to ${email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  // Batch invoice generation
  static async generateBatchInvoices(data: BatchInvoiceData): Promise<{ generated: number; failed: number }> {
    let generated = 0;
    let failed = 0;

    for (const childId of data.childIds) {
      try {
        // Get child details
        const [child] = await db
          .select()
          .from(children)
          .where(eq(children.id, childId))
          .limit(1);

        if (!child) {
          failed++;
          continue;
        }

        // Calculate amount based on period
        const baseAmount = data.period === 'weekly' ? 300 : 
                          data.period === 'biweekly' ? 600 : 1200;

        // Check for previous unpaid invoices if late fees should be included
        let lateFees = 0;
        if (data.includeLateFees) {
          // Mock calculation - would check actual invoice table
          lateFees = 0; // Would calculate based on overdue invoices
        }

        // Generate invoice (mock - would insert into invoices table)
        const invoice = {
          childId,
          amount: baseAmount + lateFees,
          dueDate: data.dueDate,
          period: data.period,
          status: 'pending',
          createdAt: new Date(),
        };

        console.log('Generated invoice:', invoice);
        generated++;
      } catch (error) {
        console.error(`Failed to generate invoice for child ${childId}:`, error);
        failed++;
      }
    }

    return { generated, failed };
  }

  // Batch enrollment for siblings
  static async batchEnroll(data: BatchEnrollmentData): Promise<{ enrolled: number; failed: number }> {
    let enrolled = 0;
    let failed = 0;

    for (const childData of data.children) {
      try {
        await db.insert(children).values({
          firstName: childData.firstName,
          lastName: childData.lastName,
          dateOfBirth: childData.dateOfBirth,
          ageGroup: childData.ageGroup,
          parentEmail: childData.parentEmail,
          parentPhone: childData.parentPhone,
          room: childData.room || 'Unassigned',
          isActive: 1,
          enrollmentStatus: 'enrolled',
          enrollmentDate: new Date(),
        });

        if (data.sendWelcomeEmail) {
          // Queue welcome email (mock)
          console.log(`Queued welcome email for ${childData.parentEmail}`);
        }

        enrolled++;
      } catch (error) {
        console.error(`Failed to enroll ${childData.firstName} ${childData.lastName}:`, error);
        failed++;
      }
    }

    return { enrolled, failed };
  }

  // Batch update room assignments
  static async batchUpdateRooms(assignments: Array<{ childId: string; room: string }>): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const assignment of assignments) {
      try {
        const result = await db
          .update(children)
          .set({ room: assignment.room })
          .where(eq(children.id, assignment.childId));

        if (result.rowCount && result.rowCount > 0) {
          updated++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to update room for child ${assignment.childId}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  // Batch archive inactive children
  static async archiveInactiveChildren(inactiveDays: number = 90): Promise<{ archived: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    // Find children with no attendance in the specified period
    const inactiveChildren = await db
      .select({ id: children.id })
      .from(children)
      .leftJoin(
        attendance,
        and(
          eq(attendance.childId, children.id),
          gte(attendance.date, cutoffDate.toISOString().split('T')[0])
        )
      )
      .where(
        and(
          eq(children.isActive, 1),
          sql`${attendance.id} IS NULL`
        )
      );

    let archived = 0;
    for (const child of inactiveChildren) {
      try {
        await db
          .update(children)
          .set({ 
            isActive: 0,
            enrollmentStatus: 'unenrolled',
            unenrollmentDate: new Date(),
            unenrollmentReason: `Inactive for ${inactiveDays} days`
          })
          .where(eq(children.id, child.id));
        
        archived++;
      } catch (error) {
        console.error(`Failed to archive child ${child.id}:`, error);
      }
    }

    return { archived };
  }
}