import express from 'express';
import { z } from 'zod';
import { backgroundJobService } from '../services/backgroundJobService';

const router = express.Router();

// Schema for job creation
const createJobSchema = z.object({
  type: z.enum([
    'generate-daily-report',
    'send-bulk-email',
    'process-payroll',
    'generate-analytics',
    'cleanup-old-data'
  ]),
  data: z.any(),
  maxRetries: z.number().optional(),
});

// Create a new job
router.post('/jobs', async (req, res) => {
  try {
    const { type, data, maxRetries } = createJobSchema.parse(req.body);
    
    const jobId = await backgroundJobService.addJob(type, data, maxRetries);
    
    res.json({
      success: true,
      jobId,
      message: `Job ${type} queued successfully`,
    });
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get job status
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = backgroundJobService.getJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error: any) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs or filter by status
router.get('/jobs', async (req, res) => {
  try {
    const { status } = req.query;
    
    let jobs;
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status as string)) {
      jobs = backgroundJobService.getJobsByStatus(status as any);
    } else {
      jobs = backgroundJobService.getAllJobs();
    }
    
    res.json(jobs);
  } catch (error: any) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job progress summary
router.get('/jobs-progress', async (req, res) => {
  try {
    const progress = backgroundJobService.getJobProgress();
    res.json(progress);
  } catch (error: any) {
    console.error('Error getting job progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger specific job types
router.post('/jobs/daily-report', async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0], sendEmail = false, recipients = [] } = req.body;
    
    const jobId = await backgroundJobService.addJob('generate-daily-report', {
      date,
      sendEmail,
      recipients,
    });
    
    res.json({
      success: true,
      jobId,
      message: `Daily report for ${date} queued`,
    });
  } catch (error: any) {
    console.error('Error creating daily report job:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs/payroll', async (req, res) => {
  try {
    const { payPeriodStart, payPeriodEnd } = req.body;
    
    if (!payPeriodStart || !payPeriodEnd) {
      return res.status(400).json({ error: 'Pay period start and end dates required' });
    }
    
    const jobId = await backgroundJobService.addJob('process-payroll', {
      payPeriodStart,
      payPeriodEnd,
    });
    
    res.json({
      success: true,
      jobId,
      message: `Payroll processing queued for ${payPeriodStart} to ${payPeriodEnd}`,
    });
  } catch (error: any) {
    console.error('Error creating payroll job:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;