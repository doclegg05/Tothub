import cron from 'node-cron';
import { DailyReportService } from './dailyReportService';

export function initializeDailyReportsCron() {
  // Run at 5 PM every day
  const task = cron.schedule('0 17 * * *', async () => {
    console.log('Starting daily reports generation...');
    
    try {
      await DailyReportService.sendAllDailyReports(new Date());
      console.log('Daily reports generation completed successfully');
    } catch (error) {
      console.error('Error in daily reports cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'America/New_York'
  });
  
  console.log('📧 Daily reports cron job initialized (5 PM daily)');
  
  return task;
}

export function initializeAllCronJobs() {
  console.log('Initializing cron jobs...');
  
  // Initialize daily reports cron
  initializeDailyReportsCron();
  
  // Add other cron jobs here as needed
  
  console.log('All cron jobs initialized successfully');
}