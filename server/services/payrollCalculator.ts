import { create, all } from 'mathjs';
import { format, addDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { Staff, TimesheetEntry, PayPeriod } from '@shared/schema';

// Initialize math.js with precision for financial calculations
const math = create(all, {
  number: 'BigNumber',
  precision: 20
});

interface PayrollCalculation {
  staffId: string;
  payPeriodId: string;
  grossPay: number; // in cents
  regularPay: number; // in cents
  overtimePay: number; // in cents
  federalTax: number; // in cents
  stateTax: number; // in cents
  socialSecurityTax: number; // in cents
  medicareTax: number; // in cents
  netPay: number; // in cents
  regularHours: number; // in minutes
  overtimeHours: number; // in minutes
  totalHours: number; // in minutes
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2025 Federal Tax Brackets (single filing status)
const FEDERAL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: 95375, rate: 0.22 },
  { min: 95375, max: 182050, rate: 0.24 },
  { min: 182050, max: 231250, rate: 0.32 },
  { min: 231250, max: 578125, rate: 0.35 },
  { min: 578125, max: Infinity, rate: 0.37 }
];

// Tax rates for FICA
const SOCIAL_SECURITY_RATE = 0.062; // 6.2%
const MEDICARE_RATE = 0.0145; // 1.45%
const SOCIAL_SECURITY_MAX_WAGE = 16080000; // $160,800 in cents for 2025

// State tax rates (simplified - West Virginia as default)
const STATE_TAX_RATE = 0.065; // 6.5% for West Virginia
const STATE_STANDARD_DEDUCTION = 460000; // $4,600 in cents

export class PayrollCalculator {
  
  /**
   * Calculate total hours worked from timesheet entries
   */
  static calculateHours(timesheets: TimesheetEntry[]): { regularHours: number; overtimeHours: number; totalHours: number } {
    let totalMinutes = 0;
    
    for (const timesheet of timesheets) {
      if (timesheet.clockInTime && timesheet.clockOutTime) {
        const clockIn = new Date(timesheet.clockInTime);
        const clockOut = new Date(timesheet.clockOutTime);
        const workMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
        const adjustedMinutes = Math.max(0, workMinutes - (timesheet.breakMinutes || 0));
        totalMinutes += adjustedMinutes;
      } else if (timesheet.totalHours) {
        totalMinutes += timesheet.totalHours;
      }
    }
    
    const regularMinutes = Math.min(totalMinutes, 40 * 60); // 40 hours max for regular
    const overtimeMinutes = Math.max(0, totalMinutes - (40 * 60));
    
    return {
      regularHours: regularMinutes,
      overtimeHours: overtimeMinutes,
      totalHours: totalMinutes
    };
  }

  /**
   * Calculate gross pay based on hours and rate
   */
  static calculateGrossPay(staff: Staff, regularHours: number, overtimeHours: number): { grossPay: number; regularPay: number; overtimePay: number } {
    const hourlyRateCents = staff.hourlyRate || 0;
    
    // Convert minutes to hours for calculation
    const regularHoursDecimal = math.divide(regularHours, 60);
    const overtimeHoursDecimal = math.divide(overtimeHours, 60);
    
    // Calculate regular pay
    const regularPay = math.multiply(
      math.bignumber(regularHoursDecimal),
      math.bignumber(hourlyRateCents)
    );
    
    // Calculate overtime pay (1.5x rate)
    const overtimeRate = math.multiply(math.bignumber(hourlyRateCents), math.bignumber(1.5));
    const overtimePay = math.multiply(
      math.bignumber(overtimeHoursDecimal),
      overtimeRate
    );
    
    const grossPay = math.add(regularPay, overtimePay);
    
    return {
      grossPay: Number(grossPay),
      regularPay: Number(regularPay),
      overtimePay: Number(overtimePay)
    };
  }

  /**
   * Calculate federal income tax withholding using progressive brackets
   */
  static calculateFederalTax(annualSalary: number, allowances: number = 0): number {
    // Adjust salary based on allowances (simplified W-4 calculation)
    const allowanceAmount = allowances * 435000; // $4,350 per allowance in cents
    const taxableIncome = Math.max(0, annualSalary - allowanceAmount);
    
    let tax = 0;
    
    for (const bracket of FEDERAL_TAX_BRACKETS) {
      if (taxableIncome <= bracket.min) break;
      
      const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableAtBracket * bracket.rate;
    }
    
    return Math.round(tax);
  }

  /**
   * Calculate state income tax (simplified for West Virginia)
   */
  static calculateStateTax(annualSalary: number): number {
    const taxableIncome = Math.max(0, annualSalary - STATE_STANDARD_DEDUCTION);
    return Math.round(taxableIncome * STATE_TAX_RATE);
  }

  /**
   * Calculate Social Security tax
   */
  static calculateSocialSecurityTax(grossPay: number, yearToDateGross: number = 0): number {
    const totalGross = yearToDateGross + grossPay;
    
    if (yearToDateGross >= SOCIAL_SECURITY_MAX_WAGE) {
      return 0; // Already at max for the year
    }
    
    const taxableAmount = Math.min(grossPay, SOCIAL_SECURITY_MAX_WAGE - yearToDateGross);
    return Math.round(taxableAmount * SOCIAL_SECURITY_RATE);
  }

  /**
   * Calculate Medicare tax
   */
  static calculateMedicareTax(grossPay: number): number {
    return Math.round(grossPay * MEDICARE_RATE);
  }

  /**
   * Calculate complete payroll for an employee
   */
  static calculatePayroll(
    staff: Staff, 
    timesheets: TimesheetEntry[], 
    payPeriod: PayPeriod,
    yearToDateGross: number = 0
  ): PayrollCalculation {
    
    // Calculate hours
    const { regularHours, overtimeHours, totalHours } = this.calculateHours(timesheets);
    
    // Calculate gross pay
    const { grossPay, regularPay, overtimePay } = this.calculateGrossPay(staff, regularHours, overtimeHours);
    
    // Estimate annual salary for tax calculations
    const weeksInYear = 52;
    const payPeriodsPerYear = 26; // Bi-weekly
    const estimatedAnnualSalary = grossPay * payPeriodsPerYear;
    
    // Calculate taxes
    const annualFederalTax = this.calculateFederalTax(estimatedAnnualSalary, staff.w4Allowances || 0);
    const federalTax = Math.round(annualFederalTax / payPeriodsPerYear) + (staff.additionalTaxWithholding || 0);
    
    const annualStateTax = this.calculateStateTax(estimatedAnnualSalary);
    const stateTax = Math.round(annualStateTax / payPeriodsPerYear);
    
    const socialSecurityTax = this.calculateSocialSecurityTax(grossPay, yearToDateGross);
    const medicareTax = this.calculateMedicareTax(grossPay);
    
    // Calculate total deductions
    const totalDeductions = federalTax + stateTax + socialSecurityTax + medicareTax;
    
    // Calculate net pay
    const netPay = grossPay - totalDeductions;
    
    return {
      staffId: staff.id,
      payPeriodId: payPeriod.id,
      grossPay,
      regularPay,
      overtimePay,
      federalTax,
      stateTax,
      socialSecurityTax,
      medicareTax,
      netPay,
      regularHours,
      overtimeHours,
      totalHours
    };
  }

  /**
   * Generate pay period dates (bi-weekly)
   */
  static generatePayPeriods(year: number): { startDate: Date; endDate: Date; payDate: Date }[] {
    const payPeriods = [];
    const firstDay = new Date(year, 0, 1); // January 1st
    let currentStart = startOfWeek(firstDay, { weekStartsOn: 1 }); // Monday start
    
    while (currentStart.getFullYear() <= year) {
      const periodEnd = addDays(currentStart, 13); // 14 days total (bi-weekly)
      const payDate = addDays(periodEnd, 7); // Pay 1 week after period ends
      
      if (currentStart.getFullYear() === year || periodEnd.getFullYear() === year) {
        payPeriods.push({
          startDate: new Date(currentStart),
          endDate: periodEnd,
          payDate: payDate
        });
      }
      
      currentStart = addDays(currentStart, 14); // Next bi-weekly period
    }
    
    return payPeriods;
  }

  /**
   * Format currency from cents to display
   */
  static formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  /**
   * Format hours from minutes to display
   */
  static formatHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate year-to-date totals for an employee
   */
  static calculateYearToDate(payStubs: any[], currentYear: number): {
    grossPay: number;
    federalTax: number;
    stateTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    netPay: number;
  } {
    const ytdTotals = {
      grossPay: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurityTax: 0,
      medicareTax: 0,
      netPay: 0
    };

    for (const stub of payStubs) {
      const stubYear = new Date(stub.createdAt).getFullYear();
      if (stubYear === currentYear) {
        ytdTotals.grossPay += stub.grossPay || 0;
        ytdTotals.federalTax += stub.federalTax || 0;
        ytdTotals.stateTax += stub.stateTax || 0;
        ytdTotals.socialSecurityTax += stub.socialSecurityTax || 0;
        ytdTotals.medicareTax += stub.medicareTax || 0;
        ytdTotals.netPay += stub.netPay || 0;
      }
    }

    return ytdTotals;
  }
}