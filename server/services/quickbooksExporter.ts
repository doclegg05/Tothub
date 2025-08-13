import { db } from "../db";
import { payStubs, staff, payPeriods, timesheetEntries } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface QuickBooksPayrollEntry {
  employeeId: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalDeductions: number;
  netPay: number;
  accountCode: string; // For QB chart of accounts
}

export class QuickBooksExporter {
  /**
   * Generate CSV format compatible with QuickBooks payroll import
   */
  static async generatePayrollCSV(payPeriodId: string): Promise<string> {
    try {
      // Get pay period details
      const [payPeriod] = await db
        .select()
        .from(payPeriods)
        .where(eq(payPeriods.id, payPeriodId));

      if (!payPeriod) {
        throw new Error("Pay period not found");
      }

      // Get all pay stubs for this period with staff details
      const payrollData = await db
        .select({
          payStub: payStubs,
          staff: staff,
          payPeriod: payPeriods,
        })
        .from(payStubs)
        .innerJoin(staff, eq(payStubs.staffId, staff.id))
        .innerJoin(payPeriods, eq(payStubs.payPeriodId, payPeriods.id))
        .where(eq(payStubs.payPeriodId, payPeriodId));

      if (payrollData.length === 0) {
        throw new Error("No payroll data found for this period");
      }

      // CSV Headers for QuickBooks
      const headers = [
        "Employee ID",
        "Employee Name", 
        "Pay Period Start",
        "Pay Period End",
        "Regular Hours",
        "Overtime Hours",
        "Regular Pay",
        "Overtime Pay",
        "Gross Pay",
        "Federal Tax",
        "State Tax",
        "Social Security Tax",
        "Medicare Tax",
        "Total Deductions",
        "Net Pay",
        "Account Code"
      ];

      // Generate CSV rows
      const rows = payrollData.map(({ payStub, staff: staffMember, payPeriod }) => [
        staffMember.employeeNumber || staffMember.id,
        `"${staffMember.firstName} ${staffMember.lastName}"`,
        payPeriod.startDate?.toISOString().split('T')[0] || "",
        payPeriod.endDate?.toISOString().split('T')[0] || "",
        (payStub.regularHours || 0) / 60, // Convert minutes to hours
        (payStub.overtimeHours || 0) / 60,
        (payStub.regularPay || 0) / 100, // Convert cents to dollars
        (payStub.overtimePay || 0) / 100,
        (payStub.grossPay || 0) / 100,
        (payStub.federalTax || 0) / 100,
        (payStub.stateTax || 0) / 100,
        (payStub.socialSecurityTax || 0) / 100,
        (payStub.medicareTax || 0) / 100,
        ((payStub.federalTax || 0) + (payStub.stateTax || 0) + 
         (payStub.socialSecurityTax || 0) + (payStub.medicareTax || 0) + 
         (payStub.healthInsurance || 0) + (payStub.retirement401k || 0) + 
         (payStub.otherDeductions || 0)) / 100,
        (payStub.netPay || 0) / 100,
        "6000" // Default payroll expense account
      ]);

      // Combine headers and rows
      const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      
      return csvContent;
    } catch (error) {
      console.error('QuickBooks CSV generation error:', error);
      throw error;
    }
  }

  /**
   * Generate QuickBooks IIF (Intuit Interchange Format) file
   */
  static async generatePayrollIIF(payPeriodId: string): Promise<string> {
    try {
      const payrollData = await db
        .select({
          payStub: payStubs,
          staff: staff,
          payPeriod: payPeriods,
        })
        .from(payStubs)
        .innerJoin(staff, eq(payStubs.staffId, staff.id))
        .innerJoin(payPeriods, eq(payStubs.payPeriodId, payPeriods.id))
        .where(eq(payStubs.payPeriodId, payPeriodId));

      if (payrollData.length === 0) {
        throw new Error("No payroll data found for this period");
      }

      const payPeriod = payrollData[0].payPeriod;
      const payDate = payPeriod.payDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

      // IIF Header
      let iifContent = "!HDR\tPROD\tVER\tREL\tIIFVER\tDATE\tTIME\tACCNT\n";
      iifContent += "!HDR\tQuickBooks Pro 2023\t33.0\tR1\t1\t" + payDate + "\t" + new Date().toTimeString().split(' ')[0] + "\tN\n";
      
      // Transaction headers
      iifContent += "!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\tCLEAR\tTOPRINT\tNAMEADDR1\tNAMEADDR2\tNAMEADDR3\tNAMEADDR4\tNAMESTATE\tNAMEZIP\tTERMS\tPAID\tSHIPVIA\tSHIPDATE\tREP\tFOB\tPONUM\tINVTITLE\tINVMEMO\tPAIDDATE\tPAIDAMT\tPAIDREF\tINVDATE\tINVAGING\tDUEDATE\tPAYMETH\tPAYACCT\n";
      iifContent += "!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\tCLEAR\tQNTY\tPRICE\tINVITEM\tPAYITEM\tTAXABLE\tREIMBEXP\tSERVICEDATE\tOTHER2\tOTHER1\n";

      // Generate payroll transactions
      payrollData.forEach(({ payStub, staff: staffMember }, index) => {
        const grossPay = (payStub.grossPay || 0) / 100;
        const netPay = (payStub.netPay || 0) / 100;
        const totalTaxes = ((payStub.federalTax || 0) + (payStub.stateTax || 0) + 
                           (payStub.socialSecurityTax || 0) + (payStub.medicareTax || 0)) / 100;

        // Main payroll transaction
        iifContent += `TRNS\tPAYCHECK\t${payDate}\tPayroll Liabilities\t${staffMember.firstName} ${staffMember.lastName}\t\t${grossPay}\t${staffMember.employeeNumber}\tPayroll - ${payDate}\tN\tN\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n`;
        
        // Gross pay split
        iifContent += `SPL\t${index + 1}\tPAYCHECK\t${payDate}\tPayroll Expenses\t${staffMember.firstName} ${staffMember.lastName}\t\t-${grossPay}\t${staffMember.employeeNumber}\tGross Pay\tN\t\t\t\t\t\t\t\t\t\n`;
        
        // Tax deductions
        if (totalTaxes > 0) {
          iifContent += `SPL\t${index + 2}\tPAYCHECK\t${payDate}\tPayroll Tax Payable\t${staffMember.firstName} ${staffMember.lastName}\t\t${totalTaxes}\t${staffMember.employeeNumber}\tTax Deductions\tN\t\t\t\t\t\t\t\t\t\n`;
        }
        
        // Net pay
        iifContent += `SPL\t${index + 3}\tPAYCHECK\t${payDate}\tChecking Account\t${staffMember.firstName} ${staffMember.lastName}\t\t-${netPay}\t${staffMember.employeeNumber}\tNet Pay\tN\t\t\t\t\t\t\t\t\t\n`;
      });

      return iifContent;
    } catch (error) {
      console.error('QuickBooks IIF generation error:', error);
      throw error;
    }
  }

  /**
   * Generate general ledger summary for accounting
   */
  static async generateGeneralLedgerSummary(payPeriodId: string): Promise<{
    totalPayrollExpense: number;
    totalTaxLiabilities: number;
    totalNetPay: number;
    employeeCount: number;
    breakdown: Array<{
      account: string;
      debit: number;
      credit: number;
      description: string;
    }>;
  }> {
    try {
      const payrollData = await db
        .select({
          payStub: payStubs,
          staff: staff,
        })
        .from(payStubs)
        .innerJoin(staff, eq(payStubs.staffId, staff.id))
        .where(eq(payStubs.payPeriodId, payPeriodId));

      const totals = payrollData.reduce((acc, { payStub }) => {
        acc.totalPayrollExpense += (payStub.grossPay || 0) / 100;
        acc.totalTaxLiabilities += ((payStub.federalTax || 0) + (payStub.stateTax || 0) + 
                                   (payStub.socialSecurityTax || 0) + (payStub.medicareTax || 0)) / 100;
        acc.totalNetPay += (payStub.netPay || 0) / 100;
        return acc;
      }, {
        totalPayrollExpense: 0,
        totalTaxLiabilities: 0,
        totalNetPay: 0,
      });

      const breakdown = [
        {
          account: "6000 - Payroll Expense",
          debit: totals.totalPayrollExpense,
          credit: 0,
          description: "Total gross wages paid to employees"
        },
        {
          account: "2400 - Payroll Tax Payable",
          debit: 0,
          credit: totals.totalTaxLiabilities,
          description: "Tax withholdings to be remitted"
        },
        {
          account: "1000 - Checking Account", 
          debit: 0,
          credit: totals.totalNetPay,
          description: "Net pay disbursed to employees"
        }
      ];

      return {
        ...totals,
        employeeCount: payrollData.length,
        breakdown,
      };
    } catch (error) {
      console.error('General ledger summary error:', error);
      throw error;
    }
  }

  /**
   * Generate tax filing reports (941, state forms)
   */
  static async generateTaxReports(quarter: number, year: number): Promise<{
    form941Data: any;
    stateWithholding: any;
    summary: any;
  }> {
    try {
      // Calculate quarter date range
      const quarterStart = new Date(year, (quarter - 1) * 3, 1);
      const quarterEnd = new Date(year, quarter * 3, 0);

      // Get all pay periods in quarter
      const quarterPayroll = await db
        .select({
          payStub: payStubs,
          staff: staff,
          payPeriod: payPeriods,
        })
        .from(payStubs)
        .innerJoin(staff, eq(payStubs.staffId, staff.id))
        .innerJoin(payPeriods, eq(payStubs.payPeriodId, payPeriods.id))
        .where(
          and(
            eq(payPeriods.status, "closed"),
            // Add date filtering logic here
          )
        );

      const quarterTotals = quarterPayroll.reduce((acc, { payStub }) => {
        acc.totalWages += (payStub.grossPay || 0) / 100;
        acc.federalWithholding += (payStub.federalTax || 0) / 100;
        acc.socialSecurityWages += (payStub.grossPay || 0) / 100;
        acc.socialSecurityTax += (payStub.socialSecurityTax || 0) / 100;
        acc.medicareWages += (payStub.grossPay || 0) / 100;
        acc.medicareTax += (payStub.medicareTax || 0) / 100;
        acc.stateWithholding += (payStub.stateTax || 0) / 100;
        return acc;
      }, {
        totalWages: 0,
        federalWithholding: 0,
        socialSecurityWages: 0,
        socialSecurityTax: 0,
        medicareWages: 0,
        medicareTax: 0,
        stateWithholding: 0,
      });

      return {
        form941Data: {
          quarter,
          year,
          employeeCount: new Set(quarterPayroll.map(p => p.staff.id)).size,
          ...quarterTotals,
          totalTaxLiability: quarterTotals.federalWithholding + 
                            quarterTotals.socialSecurityTax + 
                            quarterTotals.medicareTax,
        },
        stateWithholding: {
          quarter,
          year,
          totalStateWages: quarterTotals.totalWages,
          stateWithholding: quarterTotals.stateWithholding,
        },
        summary: {
          period: `Q${quarter} ${year}`,
          totalPayrollProcessed: quarterTotals.totalWages,
          totalTaxesWithheld: quarterTotals.federalWithholding + 
                              quarterTotals.socialSecurityTax + 
                              quarterTotals.medicareTax + 
                              quarterTotals.stateWithholding,
        },
      };
    } catch (error) {
      console.error('Tax report generation error:', error);
      throw error;
    }
  }

/**
 * Generate IIF format for QuickBooks import
 */
static async exportPayPeriodIIF(payPeriodId: string): Promise<string> {
  try {
    const payrollData = await this.generatePayrollCSV(payPeriodId);
    // Convert CSV to IIF format
    const iifContent = `!TRNS	TRNSID	TRNSTYPE	DATE	ACCNT	NAME	CLASS	AMOUNT	MEMO	SPL	SPLID	SPLTRNSTYPE	SPLACCNT	SPLNAME	SPLCLASS	SPLAMOUNT	SPLMEMO
!SPL	SPLID	SPLTRNSTYPE	SPLACCNT	SPLNAME	SPLCLASS	SPLAMOUNT	SPLMEMO
!ENDTRNS
${payrollData}`;
    return iifContent;
  } catch (error) {
    console.error('IIF export error:', error);
    throw error;
  }
}

/**
 * Generate CSV format for QuickBooks import
 */
static async exportPayPeriodCSV(payPeriodId: string): Promise<string> {
  try {
    return await this.generatePayrollCSV(payPeriodId);
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
}

/**
 * Generate General Ledger summary
 */
static async generateGLSummary(payPeriodId: string): Promise<any> {
  try {
    return await this.generateGeneralLedgerSummary(payPeriodId);
  } catch (error) {
    console.error('GL summary error:', error);
    throw error;
  }
}
}