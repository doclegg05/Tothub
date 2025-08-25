import { storage } from "../storage";
import { DailyReport, TeacherNote } from "@shared/schema";
import sgMail from '@sendgrid/mail';
import { format } from 'date-fns';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface DailyReportData {
  attendance: any;
  totalHours: number;
  activities: string[];
  meals: string[];
  photos: string[];
  averageMood: number | null;
  teacherNotes: TeacherNote[];
  milestones: string[];
  napNotes: string | null;
  behaviorNotes: string | null;
}

export class DailyReportService {
  // Aggregate all daily data for a child
  static async generateDailyReport(childId: string, date: Date): Promise<DailyReportData> {
    const dayData = await storage.getChildDayData(childId, date);
    
    // Calculate total hours
    let totalHours = 0;
    if (dayData.attendance?.checkInTime && dayData.attendance?.checkOutTime) {
      const checkIn = new Date(dayData.attendance.checkInTime);
      const checkOut = new Date(dayData.attendance.checkOutTime);
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }
    
    // Calculate average mood if available
    let averageMood = null;
    if (dayData.attendance?.moodRating) {
      averageMood = dayData.attendance.moodRating;
    }
    
    return {
      attendance: dayData.attendance,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      activities: dayData.activities || [],
      meals: dayData.meals || [],
      photos: dayData.photos || [],
      averageMood,
      teacherNotes: dayData.teacherNotes || [],
      milestones: this.extractMilestones(dayData.activities || []),
      napNotes: dayData.naps,
      behaviorNotes: dayData.behaviorNotes
    };
  }

  // Extract milestones from activities
  private static extractMilestones(activities: string[]): string[] {
    const milestoneKeywords = ['first', 'learned', 'mastered', 'achievement', 'milestone'];
    return activities.filter(activity => 
      milestoneKeywords.some(keyword => 
        activity.toLowerCase().includes(keyword)
      )
    );
  }

  // Generate HTML email from report data
  static async generateEmailHTML(report: DailyReportData, child: any): Promise<string> {
    const moodEmoji = report.averageMood ? 
      (report.averageMood >= 4 ? '😊' : report.averageMood >= 3 ? '😐' : '😔') : '';
    
    const teacherNotesHTML = report.teacherNotes.map(note => `
      <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
        <strong>${note.category || 'General'}:</strong> ${note.note}
      </div>
    `).join('');
    
    const activitiesHTML = report.activities.map(activity => 
      `<li style="margin-bottom: 5px;">${activity}</li>`
    ).join('');
    
    const mealsHTML = report.meals.map(meal => 
      `<li style="margin-bottom: 5px;">${meal}</li>`
    ).join('');
    
    const photosHTML = report.photos.slice(0, 6).map(photoUrl => 
      `<img src="${photoUrl}" alt="Activity photo" style="width: 150px; height: 150px; object-fit: cover; margin: 5px; border-radius: 5px;">`
    ).join('');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${child.firstName}'s Daily Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">${child.firstName}'s Day at TotHub</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">${format(new Date(), 'MMMM d, yyyy')}</p>
    </div>
    
    <!-- Summary Stats -->
    <div style="padding: 20px; background-color: #f8f9fa;">
      <table style="width: 100%; text-align: center;">
        <tr>
          <td style="padding: 10px;">
            <div style="font-size: 24px; color: #667eea; font-weight: bold;">${report.totalHours}</div>
            <div style="color: #666; font-size: 14px;">Hours at School</div>
          </td>
          <td style="padding: 10px;">
            <div style="font-size: 24px;">${moodEmoji}</div>
            <div style="color: #666; font-size: 14px;">Overall Mood</div>
          </td>
          <td style="padding: 10px;">
            <div style="font-size: 24px; color: #667eea; font-weight: bold;">${report.activities.length}</div>
            <div style="color: #666; font-size: 14px;">Activities</div>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 20px;">
      ${teacherNotesHTML.length > 0 ? `
        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Teacher's Notes</h2>
        ${teacherNotesHTML}
      ` : ''}
      
      ${activitiesHTML.length > 0 ? `
        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Today's Activities</h2>
        <ul style="color: #666; line-height: 1.6;">
          ${activitiesHTML}
        </ul>
      ` : ''}
      
      ${mealsHTML.length > 0 ? `
        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Meals & Snacks</h2>
        <ul style="color: #666; line-height: 1.6;">
          ${mealsHTML}
        </ul>
      ` : ''}
      
      ${report.napNotes ? `
        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Nap Time</h2>
        <p style="color: #666; line-height: 1.6;">${report.napNotes}</p>
      ` : ''}
      
      ${photosHTML.length > 0 ? `
        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Photos from Today</h2>
        <div style="text-align: center;">
          ${photosHTML}
        </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
      <p style="margin: 0 0 10px 0;">Have questions about ${child.firstName}'s day?</p>
      <a href="mailto:${process.env.REPLY_TO_EMAIL || 'info@tothub.com'}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply to Teacher</a>
      <p style="margin: 20px 0 0 0; font-size: 12px;">
        © 2025 TotHub. All rights reserved.<br>
        <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
        <a href="#" style="color: #667eea; text-decoration: none;">Update Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Send report via SendGrid
  static async sendDailyReport(childId: string, date: Date): Promise<void> {
    const child = await storage.getChild(childId);
    if (!child) {
      console.error(`Child not found: ${childId}`);
      return;
    }

    // Check if daily reports are enabled
    if (!child.parentEmail) {
      console.log(`No parent email for child: ${child.firstName} ${child.lastName}`);
      return;
    }

    try {
      const report = await this.generateDailyReport(childId, date);
      const html = await this.generateEmailHTML(report, child);

      const msg = {
        to: child.parentEmail,
        from: process.env.FROM_EMAIL || 'noreply@tothub.com',
        subject: `${child.firstName}'s Day at TotHub - ${format(date, 'MMMM d')}`,
        html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };

      if (process.env.SENDGRID_API_KEY) {
        const [response] = await sgMail.send(msg);
        
        // Update daily report status
        const existingReport = await storage.getDailyReport(childId, date);
        if (existingReport) {
          await storage.updateDailyReport(existingReport.id, {
            sentToParent: true,
            emailStatus: 'sent',
            emailMessageId: response.headers['x-message-id']
          });
        } else {
          await storage.createDailyReport({
            childId,
            date,
            attendanceStatus: report.attendance ? 'present' : 'absent',
            meals: report.meals,
            activities: report.activities,
            photoUrls: report.photos,
            behaviorNotes: report.behaviorNotes,
            naps: report.napNotes,
            isGenerated: true,
            sentToParent: true,
            emailStatus: 'sent',
            emailMessageId: response.headers['x-message-id']
          });
        }
        
        console.log(`Daily report sent for ${child.firstName} ${child.lastName}`);
      } else {
        console.log('SendGrid API key not configured - email not sent');
        console.log('To:', child.parentEmail);
        console.log('Subject:', msg.subject);
      }
    } catch (error) {
      console.error(`Failed to send daily report for child ${childId}:`, error);
      
      // Update status to failed
      const existingReport = await storage.getDailyReport(childId, date);
      if (existingReport) {
        await storage.updateDailyReport(existingReport.id, {
          emailStatus: 'failed'
        });
      }
    }
  }

  // Send reports for all present children
  static async sendAllDailyReports(date: Date = new Date()): Promise<void> {
    console.log(`Starting daily reports generation for ${format(date, 'yyyy-MM-dd')}...`);
    
    const presentChildren = await storage.getPresentChildrenForDate(date);
    console.log(`Found ${presentChildren.length} children present today`);
    
    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < presentChildren.length; i += batchSize) {
      const batch = presentChildren.slice(i, i + batchSize);
      await Promise.all(
        batch.map(attendance => 
          this.sendDailyReport(attendance.childId, date)
            .catch(err => console.error(`Failed to send report for ${attendance.childId}:`, err))
        )
      );
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < presentChildren.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Daily reports generation completed');
  }
}