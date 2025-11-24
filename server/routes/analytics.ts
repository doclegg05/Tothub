import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService';

const router = Router();

// Get attendance trends
router.get('/attendance-trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await AnalyticsService.getAttendanceTrends(days);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    res.status(500).json({ message: 'Failed to fetch attendance trends' });
  }
});

// Get staff utilization
router.get('/staff-utilization', async (req, res) => {
  try {
    const stats = await AnalyticsService.getStaffUtilization();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff utilization:', error);
    res.status(500).json({ message: 'Failed to fetch staff utilization' });
  }
});

// Get revenue forecast
router.get('/revenue-forecast', async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const forecast = await AnalyticsService.getRevenueForecast(months);
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    res.status(500).json({ message: 'Failed to fetch revenue forecast' });
  }
});

// Get parent engagement metrics
router.get('/parent-engagement', async (req, res) => {
  try {
    const engagement = await AnalyticsService.getParentEngagement();
    res.json(engagement);
  } catch (error) {
    console.error('Error fetching parent engagement:', error);
    res.status(500).json({ message: 'Failed to fetch parent engagement' });
  }
});

// Get age group distribution
router.get('/age-distribution', async (req, res) => {
  try {
    const distribution = await AnalyticsService.getAgeGroupDistribution();
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching age distribution:', error);
    res.status(500).json({ message: 'Failed to fetch age distribution' });
  }
});

// Get room utilization
router.get('/room-utilization', async (req, res) => {
  try {
    const utilization = await AnalyticsService.getRoomUtilization();
    res.json(utilization);
  } catch (error) {
    console.error('Error fetching room utilization:', error);
    res.status(500).json({ message: 'Failed to fetch room utilization' });
  }
});

export default router;