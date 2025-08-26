import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { PayStub, Staff, PayPeriod } from '@shared/schema';
import { PayrollCalculator } from './payrollCalculator';

interface PayStubData extends PayStub {
  staff: Staff & {
    hourlyRate?: number;
    employeeNumber?: string;
    directDepositAccount?: string;
    directDepositRouting?: string;
  };
  payPeriod: PayPeriod & {
    payDate: string;
  };
  yearToDate?: {
    grossPay: number;
    federalTax: number;
    stateTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    netPay: number;
  };
}

export class PayStubGenerator {
  
  /**
   * Generate a PDF pay stub for an employee
   */
  static generatePayStub(payStubData: PayStubData): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('KidSign Pro Daycare', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Pay Statement', pageWidth / 2, 40, { align: 'center' });
    
    // Pay period information
    doc.setFontSize(10);
    const payPeriodStart = format(new Date(payStubData.payPeriod.startDate), 'MM/dd/yyyy');
    const payPeriodEnd = format(new Date(payStubData.payPeriod.endDate), 'MM/dd/yyyy');
    const payDate = format(new Date(payStubData.payPeriod.payDate), 'MM/dd/yyyy');
    
    doc.text(`Pay Period: ${payPeriodStart} - ${payPeriodEnd}`, 20, 60);
    doc.text(`Pay Date: ${payDate}`, 20, 70);
    doc.text(`Pay Stub ID: ${payStubData.id.substring(0, 8)}`, 20, 80);
    
    // Employee information
    doc.text(`Employee: ${payStubData.staff.firstName} ${payStubData.staff.lastName}`, pageWidth - 20, 60, { align: 'right' });
    doc.text(`Employee #: ${payStubData.staff.employeeNumber || 'N/A'}`, pageWidth - 20, 70, { align: 'right' });
    doc.text(`Position: ${payStubData.staff.position}`, pageWidth - 20, 80, { align: 'right' });
    
    // Hours and earnings table
    (doc as any).autoTable({
      startY: 100,
      head: [['Description', 'Hours', 'Rate', 'Current', 'Year to Date']],
      body: [
        [
          'Regular Pay',
          PayrollCalculator.formatHours(payStubData.regularHours),
          PayrollCalculator.formatCurrency(payStubData.staff.hourlyRate || 0),
          PayrollCalculator.formatCurrency(payStubData.regularPay),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.grossPay || 0)
        ],
        [
          'Overtime Pay',
          PayrollCalculator.formatHours(payStubData.overtimeHours || 0),
          PayrollCalculator.formatCurrency((payStubData.staff.hourlyRate || 0) * 1.5),
          PayrollCalculator.formatCurrency(payStubData.overtimePay || 0),
          '-'
        ],
        [
          'Gross Pay',
          PayrollCalculator.formatHours(payStubData.totalHours),
          '-',
          PayrollCalculator.formatCurrency(payStubData.grossPay),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.grossPay || 0)
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });
    
    // Deductions table
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    (doc as any).autoTable({
      startY: finalY,
      head: [['Deductions', 'Current', 'Year to Date']],
      body: [
        [
          'Federal Income Tax',
          PayrollCalculator.formatCurrency(payStubData.federalTax || 0),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.federalTax || 0)
        ],
        [
          'State Income Tax',
          PayrollCalculator.formatCurrency(payStubData.stateTax || 0),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.stateTax || 0)
        ],
        [
          'Social Security',
          PayrollCalculator.formatCurrency(payStubData.socialSecurityTax || 0),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.socialSecurityTax || 0)
        ],
        [
          'Medicare',
          PayrollCalculator.formatCurrency(payStubData.medicareTax || 0),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.medicareTax || 0)
        ],
        [
          'Health Insurance',
          PayrollCalculator.formatCurrency(payStubData.healthInsurance || 0),
          '-'
        ],
        [
          '401(k) Contribution',
          PayrollCalculator.formatCurrency(payStubData.retirement401k || 0),
          '-'
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: 20, right: 20 }
    });
    
    // Net pay summary
    const netPayY = (doc as any).lastAutoTable.finalY + 20;
    
    (doc as any).autoTable({
      startY: netPayY,
      head: [['Summary', 'Current', 'Year to Date']],
      body: [
        [
          'Total Deductions',
          PayrollCalculator.formatCurrency(
            (payStubData.federalTax || 0) + 
            (payStubData.stateTax || 0) + 
            (payStubData.socialSecurityTax || 0) + 
            (payStubData.medicareTax || 0) + 
            (payStubData.healthInsurance || 0) + 
            (payStubData.retirement401k || 0) + 
            (payStubData.otherDeductions || 0)
          ),
          '-'
        ],
        [
          'Net Pay',
          PayrollCalculator.formatCurrency(payStubData.netPay),
          PayrollCalculator.formatCurrency(payStubData.yearToDate?.netPay || 0)
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 12, fontStyle: 'bold' },
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 20, right: 20 }
    });
    
    // Direct deposit information
    const ddY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Direct Deposit Information:', 20, ddY);
    
    doc.setFont('helvetica', 'normal');
    if (payStubData.staff.directDepositAccount) {
      doc.text(`Account: ****${payStubData.staff.directDepositAccount.slice(-4)}`, 20, ddY + 10);
      doc.text(`Routing: ${payStubData.staff.directDepositRouting}`, 20, ddY + 20);
    } else {
      doc.text('No direct deposit information on file', 20, ddY + 10);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is a computer-generated pay stub. Please retain for your records.', pageWidth / 2, 280, { align: 'center' });
    doc.text(`Generated on ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, pageWidth / 2, 290, { align: 'center' });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Generate payroll summary report for a pay period
   */
  static generatePayrollSummary(payStubs: PayStubData[], payPeriod: PayPeriod): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Payroll Summary Report', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const periodStart = format(new Date(payPeriod.startDate), 'MM/dd/yyyy');
    const periodEnd = format(new Date(payPeriod.endDate), 'MM/dd/yyyy');
    doc.text(`Pay Period: ${periodStart} - ${periodEnd}`, pageWidth / 2, 45, { align: 'center' });
    
    // Summary statistics
    const totalGross = payStubs.reduce((sum, stub) => sum + stub.grossPay, 0);
    const totalNet = payStubs.reduce((sum, stub) => sum + stub.netPay, 0);
    const totalFederal = payStubs.reduce((sum, stub) => sum + (stub.federalTax || 0), 0);
    const totalState = payStubs.reduce((sum, stub) => sum + (stub.stateTax || 0), 0);
    const totalSS = payStubs.reduce((sum, stub) => sum + (stub.socialSecurityTax || 0), 0);
    const totalMedicare = payStubs.reduce((sum, stub) => sum + (stub.medicareTax || 0), 0);
    
    (doc as any).autoTable({
      startY: 65,
      head: [['Summary', 'Amount']],
      body: [
        ['Total Employees', payStubs.length.toString()],
        ['Total Gross Pay', PayrollCalculator.formatCurrency(totalGross)],
        ['Total Federal Tax', PayrollCalculator.formatCurrency(totalFederal)],
        ['Total State Tax', PayrollCalculator.formatCurrency(totalState)],
        ['Total Social Security', PayrollCalculator.formatCurrency(totalSS)],
        ['Total Medicare', PayrollCalculator.formatCurrency(totalMedicare)],
        ['Total Net Pay', PayrollCalculator.formatCurrency(totalNet)]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 20, right: 20 }
    });
    
    // Employee details
    const detailsY = (doc as any).lastAutoTable.finalY + 20;
    
    (doc as any).autoTable({
      startY: detailsY,
      head: [['Employee', 'Hours', 'Gross Pay', 'Taxes', 'Net Pay']],
      body: payStubs.map(stub => [
        `${stub.staff.firstName} ${stub.staff.lastName}`,
        PayrollCalculator.formatHours(stub.totalHours),
        PayrollCalculator.formatCurrency(stub.grossPay),
        PayrollCalculator.formatCurrency(
          (stub.federalTax || 0) + (stub.stateTax || 0) + (stub.socialSecurityTax || 0) + (stub.medicareTax || 0)
        ),
        PayrollCalculator.formatCurrency(stub.netPay)
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 20, right: 20 }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text(`Generated on ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, pageWidth / 2, 280, { align: 'center' });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Generate tax report for quarterly filing
   */
  static generateTaxReport(payStubs: PayStubData[], quarter: number, year: number): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Quarterly Tax Report', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Q${quarter} ${year}`, pageWidth / 2, 45, { align: 'center' });
    
    // Tax totals
    const totalWages = payStubs.reduce((sum, stub) => sum + stub.grossPay, 0);
    const totalFederal = payStubs.reduce((sum, stub) => sum + (stub.federalTax || 0), 0);
    const totalState = payStubs.reduce((sum, stub) => sum + (stub.stateTax || 0), 0);
    const totalSS = payStubs.reduce((sum, stub) => sum + (stub.socialSecurityTax || 0), 0);
    const totalMedicare = payStubs.reduce((sum, stub) => sum + (stub.medicareTax || 0), 0);
    
    (doc as any).autoTable({
      startY: 70,
      head: [['Tax Category', 'Amount']],
      body: [
        ['Total Wages Subject to Federal Tax', PayrollCalculator.formatCurrency(totalWages)],
        ['Federal Income Tax Withheld', PayrollCalculator.formatCurrency(totalFederal)],
        ['Social Security Wages', PayrollCalculator.formatCurrency(totalWages)],
        ['Social Security Tax Withheld', PayrollCalculator.formatCurrency(totalSS)],
        ['Medicare Wages', PayrollCalculator.formatCurrency(totalWages)],
        ['Medicare Tax Withheld', PayrollCalculator.formatCurrency(totalMedicare)],
        ['State Wages', PayrollCalculator.formatCurrency(totalWages)],
        ['State Tax Withheld', PayrollCalculator.formatCurrency(totalState)]
      ],
      theme: 'grid',
      styles: { fontSize: 11 },
      headStyles: { fillColor: [155, 89, 182] },
      margin: { left: 20, right: 20 }
    });
    
    // Notes
    const notesY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, notesY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('• This report is for informational purposes only', 20, notesY + 15);
    doc.text('• Consult with a tax professional for official filings', 20, notesY + 25);
    doc.text('• All amounts are in US Dollars', 20, notesY + 35);
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}