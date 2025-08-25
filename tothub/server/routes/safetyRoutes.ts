import { Router } from 'express';
import { SafetyReminderService } from '../services/safetyReminderService';
import { insertSafetyReminderSchema, insertSafetyReminderCompletionSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get all safety reminders
router.get('/reminders', async (req, res) => {
  try {
    const reminders = await SafetyReminderService.getAllReminders();
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching safety reminders:', error);
    res.status(500).json({ error: 'Failed to fetch safety reminders' });
  }
});

// Get reminders by category
router.get('/reminders/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const reminders = await SafetyReminderService.getRemindersByCategory(category);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by category:', error);
    res.status(500).json({ error: 'Failed to fetch reminders by category' });
  }
});

// Get upcoming alerts
router.get('/reminders/upcoming', async (req, res) => {
  try {
    const alerts = await SafetyReminderService.getUpcomingAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching upcoming alerts:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming alerts' });
  }
});

// Get overdue reminders
router.get('/reminders/overdue', async (req, res) => {
  try {
    const overdue = await SafetyReminderService.getOverdueReminders();
    res.json(overdue);
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    res.status(500).json({ error: 'Failed to fetch overdue reminders' });
  }
});

// Get safety reminder statistics
router.get('/reminders/statistics', async (req, res) => {
  try {
    const stats = await SafetyReminderService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching safety statistics:', error);
    res.status(500).json({ error: 'Failed to fetch safety statistics' });
  }
});

// Get predefined templates
router.get('/reminders/templates', async (req, res) => {
  try {
    const templates = SafetyReminderService.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching safety templates:', error);
    res.status(500).json({ error: 'Failed to fetch safety templates' });
  }
});

// Create a new safety reminder
router.post('/reminders', async (req, res) => {
  try {
    const reminderData = insertSafetyReminderSchema.parse(req.body);
    const newReminder = await SafetyReminderService.createReminder(reminderData);
    res.status(201).json(newReminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid reminder data', details: error.errors });
    }
    console.error('Error creating safety reminder:', error);
    res.status(500).json({ error: 'Failed to create safety reminder' });
  }
});

// Update a safety reminder
router.put('/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertSafetyReminderSchema.partial().parse(req.body);
    const updatedReminder = await SafetyReminderService.updateReminder(id, updateData);
    
    if (!updatedReminder) {
      return res.status(404).json({ error: 'Safety reminder not found' });
    }
    
    res.json(updatedReminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid update data', details: error.errors });
    }
    console.error('Error updating safety reminder:', error);
    res.status(500).json({ error: 'Failed to update safety reminder' });
  }
});

// Toggle pause status of a reminder
router.post('/reminders/:id/toggle-pause', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReminder = await SafetyReminderService.togglePauseReminder(id);
    
    if (!updatedReminder) {
      return res.status(404).json({ error: 'Safety reminder not found' });
    }
    
    res.json(updatedReminder);
  } catch (error) {
    console.error('Error toggling reminder pause:', error);
    res.status(500).json({ error: 'Failed to toggle reminder pause' });
  }
});

// Deactivate a safety reminder
router.delete('/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await SafetyReminderService.deactivateReminder(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Safety reminder not found' });
    }
    
    res.json({ message: 'Safety reminder deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating safety reminder:', error);
    res.status(500).json({ error: 'Failed to deactivate safety reminder' });
  }
});

// Mark a reminder as completed
router.post('/reminders/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const completionData = insertSafetyReminderCompletionSchema.parse({
      ...req.body,
      reminderId: id,
    });
    
    const completion = await SafetyReminderService.completeReminder(id, completionData);
    res.status(201).json(completion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid completion data', details: error.errors });
    }
    console.error('Error completing safety reminder:', error);
    res.status(500).json({ error: 'Failed to complete safety reminder' });
  }
});

// Get completion history for a reminder
router.get('/reminders/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await SafetyReminderService.getCompletionHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching completion history:', error);
    res.status(500).json({ error: 'Failed to fetch completion history' });
  }
});

export default router;