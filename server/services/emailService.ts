// Nodemailer lacks types in this project; import as any to avoid TS error
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Configure email service based on environment
const isProduction = process.env.NODE_ENV === 'production';
const hasSendGrid = !!process.env.SENDGRID_API_KEY;

// Initialize SendGrid if API key is available
if (hasSendGrid && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Development email transport (logs to console)
const devTransport = {
  sendMail: async (options: any) => {
    console.log('📧 Development Email:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    if (options.html) {
      console.log('HTML:', options.html);
    }
    return { messageId: 'dev-' + Date.now() };
  }
};

// Get email transport based on environment
const getTransport = () => {
  if (!isProduction) {
    return devTransport;
  }
  
  if (hasSendGrid) {
    // Use SendGrid in production
    return null; // We'll use sgMail directly
  }
  
  // Fallback to SMTP if configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // No email service configured
  return null;
};

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@tothub.com';
    
    if (hasSendGrid && isProduction) {
      // Use SendGrid
      await sgMail.send({
        to: options.to,
        from: fromEmail,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      console.log(`✅ Email sent via SendGrid to ${options.to}`);
      return true;
    }
    
    // Use nodemailer or dev transport
    const transport = getTransport();
    if (!transport) {
      console.warn('⚠️ No email service configured');
      return false;
    }
    
    await transport.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    console.log(`✅ Email sent to ${options.to}`);
    return true;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  passwordReset: (username: string, resetLink: string) => ({
    subject: 'TotHub - Password Reset Request',
    text: `Hello ${username},\n\nYou requested a password reset. Click the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTotHub Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${username},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666;">This link will expire in 1 hour.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Best regards,<br>TotHub Team</p>
      </div>
    `
  }),
  
  usernameRecovery: (username: string, email: string) => ({
    subject: 'TotHub - Username Recovery',
    text: `Hello,\n\nYou requested your username for the account associated with ${email}.\n\nYour username is: ${username}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTotHub Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Username Recovery</h2>
        <p>Hello,</p>
        <p>You requested your username for the account associated with ${email}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;">Your username is: <strong>${username}</strong></p>
        </div>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Best regards,<br>TotHub Team</p>
      </div>
    `
  })
};