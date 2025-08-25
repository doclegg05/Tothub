import { EventEmitter } from 'events';
import { storage } from '../storage';

interface Job {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retries: number;
  maxRetries: number;
}

export class BackgroundJobService extends EventEmitter {
  private static instance: BackgroundJobService;
  private jobs: Map<string, Job> = new Map();
  private processing: boolean = false;
  private concurrency: number = 2;
  private activeJobs: number = 0;

  private constructor() {
    super();
    this.startProcessor();
  }

  public static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  // Add a job to the queue
  public async addJob(type: string, data: any, maxRetries: number = 3): Promise<string> {
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      retries: 0,
      maxRetries,
    };

    this.jobs.set(job.id, job);
    this.emit('job:added', job);
    
    // Process immediately if not at capacity
    if (this.activeJobs < this.concurrency) {
      this.processNextJob();
    }

    return job.id;
  }

  // Get job status
  public getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs
  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Get jobs by status
  public getJobsByStatus(status: Job['status']): Job[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  // Clear completed jobs older than specified hours
  public clearOldJobs(hoursOld: number = 24): void {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.completedAt && job.completedAt < cutoff) {
        this.jobs.delete(id);
      }
    }
  }

  // Start the job processor
  private startProcessor(): void {
    setInterval(() => {
      this.processNextJob();
      this.clearOldJobs();
    }, 5000); // Check every 5 seconds
  }

  // Process the next pending job
  private async processNextJob(): Promise<void> {
    if (this.activeJobs >= this.concurrency) {
      return;
    }

    const pendingJobs = this.getJobsByStatus('pending');
    if (pendingJobs.length === 0) {
      return;
    }

    const job = pendingJobs[0];
    this.activeJobs++;

    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.emit('job:started', job);

      await this.executeJob(job);

      job.status = 'completed';
      job.completedAt = new Date();
      this.emit('job:completed', job);
    } catch (error: any) {
      job.error = error.message;
      job.retries++;

      if (job.retries < job.maxRetries) {
        job.status = 'pending';
        console.log(`Job ${job.id} failed, retrying (${job.retries}/${job.maxRetries})`);
      } else {
        job.status = 'failed';
        this.emit('job:failed', job);
        console.error(`Job ${job.id} failed permanently:`, error);
      }
    } finally {
      this.activeJobs--;
      
      // Process next job if available
      if (this.activeJobs < this.concurrency) {
        setTimeout(() => this.processNextJob(), 100);
      }
    }
  }

  // Execute a specific job based on its type
  private async executeJob(job: Job): Promise<void> {
    switch (job.type) {
      case 'generate-daily-report':
        await this.generateDailyReport(job.data);
        break;
        
      case 'send-bulk-email':
        await this.sendBulkEmail(job.data);
        break;
        
      case 'process-payroll':
        await this.processPayroll(job.data);
        break;
        
      case 'generate-analytics':
        await this.generateAnalytics(job.data);
        break;
        
      case 'cleanup-old-data':
        await this.cleanupOldData(job.data);
        break;
        
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  // Job handlers
  private async generateDailyReport(data: any): Promise<void> {
    console.log(`Generating daily report for ${data.date}`);
    
    // Get daily statistics
    const date = new Date(data.date);
    const attendance = await storage.getAttendanceByDate(date);
    const presentChildren = attendance.filter(a => a.checkInTime && !a.checkOutTime);
    
    const report = {
      date: data.date,
      totalChildren: presentChildren.length,
      attendance: attendance.length,
      generatedAt: new Date(),
    };
    
    // TODO: Save report to database
    console.log('Daily report generated:', report);
  }

  private async sendBulkEmail(data: any): Promise<void> {
    const { recipients, subject, content } = data;
    
    console.log(`Sending bulk email to ${recipients.length} recipients`);
    
    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // TODO: Implement actual email sending
      console.log(`Sending batch ${Math.floor(i/batchSize) + 1}: ${batch.length} emails`);
      
      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async processPayroll(data: any): Promise<void> {
    const { payPeriodStart, payPeriodEnd } = data;
    
    console.log(`Processing payroll for ${payPeriodStart} to ${payPeriodEnd}`);
    
    // Get all staff
    const staffResult = await storage.getAllStaff();
    const staff = staffResult.data || [];
    
    for (const employee of staff) {
      // Calculate hours worked (simplified)
      const hoursWorked = 80; // Placeholder for 2 weeks full time
      
      // Create payroll record
      const payrollRecord = {
        staffId: employee.id,
        payPeriodStart,
        payPeriodEnd,
        hoursWorked,
        hourlyRate: employee.hourlyRate || 15,
        grossPay: hoursWorked * (employee.hourlyRate || 15),
        processedAt: new Date(),
      };
      
      console.log(`Processed payroll for ${employee.firstName} ${employee.lastName}`);
    }
  }

  private async generateAnalytics(data: any): Promise<void> {
    const { startDate, endDate, metrics } = data;
    
    console.log(`Generating analytics from ${startDate} to ${endDate}`);
    
    const analytics: any = {
      period: { startDate, endDate },
      generated: new Date(),
      metrics: {},
    };
    
    // Generate requested metrics
    if (metrics.includes('attendance')) {
      // Simplified attendance metrics
      const attendance = await storage.getAttendanceByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      analytics.metrics.attendance = {
        totalCheckIns: attendance.length,
        averagePerDay: attendance.length / 30, // Simplified
      };
    }
    
    console.log('Analytics generated:', analytics);
  }

  private async cleanupOldData(data: any): Promise<void> {
    const { daysToKeep = 365 } = data;
    
    console.log(`Cleaning up data older than ${daysToKeep} days`);
    
    // TODO: Implement actual cleanup
    // For now, just log the action
    console.log('Data cleanup completed');
  }

  // Get job progress for UI
  public getJobProgress(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
  }
}

export const backgroundJobService = BackgroundJobService.getInstance();