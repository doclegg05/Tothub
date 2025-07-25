import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailUser = process.env.EMAIL_USER || '';
    const emailPass = process.env.EMAIL_PASS || '';

    if (!emailUser || !emailPass) {
      console.warn('Email credentials not configured. Email notifications will not work.');
      return;
    }

    const config: EmailConfig = {
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendStaffingAlert(room: string, currentRatio: string, requiredRatio: string, recipients: string[]): Promise<boolean> {
    const subject = `Staffing Alert: ${room} - Ratio Compliance Issue`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Staffing Alert - Little Steps Academy</h2>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="color: #991b1b; margin-top: 0;">Room: ${room}</h3>
          <p><strong>Current Ratio:</strong> ${currentRatio}</p>
          <p><strong>Required Ratio:</strong> ${requiredRatio}</p>
          <p style="color: #dc2626;"><strong>Action Required:</strong> Additional staff member needed to maintain compliance with West Virginia regulations.</p>
        </div>
        <p>Please review staffing immediately to ensure regulatory compliance.</p>
        <hr style="margin: 24px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          This alert was generated automatically by DaycarePro.<br>
          Time: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: recipients,
      subject,
      html,
    });
  }

  async sendDailyReport(attendanceCount: number, staffCount: number, complianceStatus: string, recipients: string[]): Promise<boolean> {
    const subject = `Daily Report - Little Steps Academy - ${new Date().toLocaleDateString()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Daily Report - Little Steps Academy</h2>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="margin-top: 0;">Today's Summary</h3>
          <p><strong>Children Present:</strong> ${attendanceCount}</p>
          <p><strong>Staff On Duty:</strong> ${staffCount}</p>
          <p><strong>Compliance Status:</strong> <span style="color: ${complianceStatus === 'Compliant' ? '#059669' : '#dc2626'};">${complianceStatus}</span></p>
        </div>
        <hr style="margin: 24px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Generated automatically by DaycarePro.<br>
          Date: ${new Date().toLocaleDateString()}<br>
          Time: ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: recipients,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
