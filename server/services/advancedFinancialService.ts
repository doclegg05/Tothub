import { db } from '../db';
import { children, billing, staff, attendance } from '@shared/schema';
import { sql, eq, and, gte, lte, ne, sum, count, inArray } from 'drizzle-orm';
import { format, addDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export interface PaymentPlan {
  childId: string;
  planType: 'weekly' | 'biweekly' | 'monthly';
  amount: number;
  startDate: Date;
  endDate?: Date;
  autopay: boolean;
  paymentMethodId?: string;
}

export interface LateFeePolicy {
  gracePeriodDays: number;
  lateFeeAmount: number;
  lateFeeType: 'fixed' | 'percentage';
  maxLateFee?: number;
}

export interface SubsidyApplication {
  childId: string;
  programType: 'state' | 'federal' | 'employer' | 'scholarship';
  amount: number;
  frequency: 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  documentationRequired: boolean;
  status: 'pending' | 'approved' | 'denied';
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  averageDaysToPayment: number;
  subsidyRevenue: number;
  lateFeesCollected: number;
}

export class AdvancedFinancialService {
  // Set up payment plan for a family
  static async createPaymentPlan(plan: PaymentPlan): Promise<string> {
    // Calculate payment schedule based on plan type
    const paymentDates = this.calculatePaymentDates(plan);
    
    // Create billing records for each payment
    for (const paymentDate of paymentDates) {
      await db.insert(billing).values({
        childId: plan.childId,
        amount: plan.amount,
        description: `${plan.planType} tuition payment`,
        dueDate: paymentDate,
        status: 'pending',
        autopayEnabled: plan.autopay,
      });
    }

    return `Payment plan created: ${paymentDates.length} payments scheduled`;
  }

  // Calculate payment dates based on plan type
  private static calculatePaymentDates(plan: PaymentPlan): Date[] {
    const dates: Date[] = [];
    let currentDate = plan.startDate;
    const endDate = plan.endDate || addDays(plan.startDate, 365);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      
      switch (plan.planType) {
        case 'weekly':
          currentDate = addDays(currentDate, 7);
          break;
        case 'biweekly':
          currentDate = addDays(currentDate, 14);
          break;
        case 'monthly':
          currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
          break;
      }
    }

    return dates;
  }

  // Process automated late fee assessment
  static async assessLateFees(policy: LateFeePolicy): Promise<{ assessed: number; total: number }> {
    const cutoffDate = addDays(new Date(), -policy.gracePeriodDays);
    
    // Find overdue invoices
    const overdueInvoices = await db
      .select()
      .from(billing)
      .where(
        and(
          eq(billing.status, 'pending'),
          lte(billing.dueDate, cutoffDate.toISOString().split('T')[0])
        )
      );

    let assessed = 0;
    let totalFees = 0;

    for (const invoice of overdueInvoices) {
      let lateFee = 0;
      
      if (policy.lateFeeType === 'fixed') {
        lateFee = policy.lateFeeAmount;
      } else {
        lateFee = invoice.amount * (policy.lateFeeAmount / 100);
        if (policy.maxLateFee) {
          lateFee = Math.min(lateFee, policy.maxLateFee);
        }
      }

      // Create late fee charge
      await db.insert(billing).values({
        childId: invoice.childId,
        amount: lateFee,
        description: `Late fee for invoice due ${format(invoice.dueDate, 'MM/dd/yyyy')}`,
        dueDate: new Date(),
        status: 'pending',
        isLateFee: true,
        relatedInvoiceId: invoice.id,
      });

      assessed++;
      totalFees += lateFee;
    }

    return { assessed, total: totalFees };
  }

  // Send payment reminders
  static async sendPaymentReminders(daysBefore: number = 3): Promise<{ sent: number }> {
    const reminderDate = addDays(new Date(), daysBefore);
    
    const upcomingPayments = await db
      .select({
        billing: billing,
        parentEmail: children.parentEmail,
        childName: sql`${children.firstName} || ' ' || ${children.lastName}`,
      })
      .from(billing)
      .innerJoin(children, eq(billing.childId, children.id))
      .where(
        and(
          eq(billing.status, 'pending'),
          sql`DATE(${billing.dueDate}) = DATE(${reminderDate})`
        )
      );

    // Send reminders (mock implementation)
    for (const payment of upcomingPayments) {
      console.log(`Reminder sent to ${payment.parentEmail} for $${payment.billing.amount} due on ${format(payment.billing.dueDate, 'MM/dd/yyyy')}`);
    }

    return { sent: upcomingPayments.length };
  }

  // Process subsidy applications
  static async applySubsidy(subsidy: SubsidyApplication): Promise<boolean> {
    // Validate subsidy application
    if (subsidy.documentationRequired) {
      // Check if required documents are uploaded (mock)
      console.log('Checking subsidy documentation...');
    }

    // Calculate subsidy impact on billing
    const monthlyTuition = 1200; // Base tuition
    const subsidyAmount = subsidy.frequency === 'weekly' ? subsidy.amount * 4 : subsidy.amount;
    const adjustedTuition = monthlyTuition - subsidyAmount;

    // Update future billing records
    if (subsidy.status === 'approved') {
      const futureBilling = await db
        .select()
        .from(billing)
        .where(
          and(
            eq(billing.childId, subsidy.childId),
            gte(billing.dueDate, subsidy.startDate.toISOString().split('T')[0]),
            eq(billing.status, 'pending')
          )
        );

      for (const bill of futureBilling) {
        await db
          .update(billing)
          .set({
            amount: adjustedTuition,
            subsidyApplied: true,
            subsidyAmount: subsidyAmount,
          })
          .where(eq(billing.id, bill.id));
      }
    }

    return true;
  }

  // Track financial aid
  static async getFinancialAidSummary(childId: string): Promise<{
    totalAid: number;
    activePrograms: string[];
    remainingBalance: number;
  }> {
    // Mock implementation - would query actual financial aid table
    return {
      totalAid: 400,
      activePrograms: ['State Child Care Assistance'],
      remainingBalance: 800,
    };
  }

  // Generate comprehensive financial report
  static async generateFinancialReport(
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    // Revenue calculations
    const revenue = await db
      .select({
        total: sum(billing.amount),
        collected: sum(sql`CASE WHEN ${billing.status} = 'paid' THEN ${billing.amount} ELSE 0 END`),
        count: count(billing.id),
        paidCount: sum(sql`CASE WHEN ${billing.status} = 'paid' THEN 1 ELSE 0 END`),
      })
      .from(billing)
      .where(
        and(
          gte(billing.dueDate, startDate.toISOString().split('T')[0]),
          lte(billing.dueDate, endDate.toISOString().split('T')[0])
        )
      );

    const totalRevenue = Number(revenue[0]?.total || 0);
    const totalCollected = Number(revenue[0]?.collected || 0);
    const totalOutstanding = totalRevenue - totalCollected;
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

    // Late fees collected
    const lateFees = await db
      .select({ total: sum(billing.amount) })
      .from(billing)
      .where(
        and(
          eq(billing.isLateFee, 1),
          eq(billing.status, 'paid'),
          gte(billing.paidDate, startDate.toISOString().split('T')[0]),
          lte(billing.paidDate, endDate.toISOString().split('T')[0])
        )
      );

    // Calculate average days to payment
    const paymentTimes = await db
      .select({
        avgDays: sql<number>`AVG(DATE_PART('day', ${billing.paidDate} - ${billing.dueDate}))`,
      })
      .from(billing)
      .where(
        and(
          eq(billing.status, 'paid'),
          gte(billing.paidDate, startDate.toISOString().split('T')[0]),
          lte(billing.paidDate, endDate.toISOString().split('T')[0])
        )
      );

    return {
      period: `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`,
      totalRevenue,
      totalCollected,
      totalOutstanding,
      collectionRate,
      averageDaysToPayment: Number(paymentTimes[0]?.avgDays || 0),
      subsidyRevenue: totalRevenue * 0.15, // Mock: 15% from subsidies
      lateFeesCollected: Number(lateFees[0]?.total || 0),
    };
  }

  // Automated payment processing
  static async processAutopayments(): Promise<{ processed: number; failed: number }> {
    const todayPayments = await db
      .select()
      .from(billing)
      .where(
        and(
          eq(billing.status, 'pending'),
          eq(billing.autopayEnabled, 1),
          sql`DATE(${billing.dueDate}) = CURRENT_DATE`
        )
      );

    let processed = 0;
    let failed = 0;

    for (const payment of todayPayments) {
      try {
        // Process payment (mock implementation)
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          await db
            .update(billing)
            .set({
              status: 'paid',
              paidDate: new Date(),
              paymentMethod: 'autopay',
            })
            .where(eq(billing.id, payment.id));
          
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Autopayment failed:', error);
        failed++;
      }
    }

    return { processed, failed };
  }

  // Flexible payment arrangements
  static async createPaymentArrangement(
    childId: string,
    outstandingInvoiceIds: string[],
    installments: number
  ): Promise<{ created: number }> {
    // Get total outstanding amount
    const outstanding = await db
      .select({ total: sum(billing.amount) })
      .from(billing)
      .where(
        and(
          inArray(billing.id, outstandingInvoiceIds),
          eq(billing.status, 'pending')
        )
      );

    const totalAmount = Number(outstanding[0]?.total || 0);
    const installmentAmount = totalAmount / installments;

    // Mark original invoices as under arrangement
    await db
      .update(billing)
      .set({ paymentArrangement: true })
      .where(inArray(billing.id, outstandingInvoiceIds));

    // Create installment invoices
    for (let i = 0; i < installments; i++) {
      await db.insert(billing).values({
        childId,
        amount: installmentAmount,
        description: `Payment arrangement installment ${i + 1} of ${installments}`,
        dueDate: addDays(new Date(), (i + 1) * 14), // Biweekly
        status: 'pending',
        isPaymentArrangement: true,
      });
    }

    return { created: installments };
  }
}