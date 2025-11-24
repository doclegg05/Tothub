import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { enhancedAlertService } from '../services/enhancedAlertService';

const router = Router();

// Schema for alert rule
const alertRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  condition: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  channels: z.array(z.enum(['email', 'sms', 'in-app', 'webhook'])),
  autoRemediate: z.boolean(),
  remediationAction: z.string().optional(),
  cooldownMinutes: z.number(),
  enabled: z.boolean(),
});

// Get all alert rules
router.get('/rules', async (req: Request, res: Response) => {
  try {
    const rules = enhancedAlertService.getRules();
    res.json(rules);
  } catch (error: any) {
    console.error('Error getting alert rules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update alert rule
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const ruleData = alertRuleSchema.parse(req.body);
    // Ensure id is present for the service
    const rule = {
      id: ruleData.id || `rule_${Date.now()}`,
      name: ruleData.name || 'Default Rule',
      condition: ruleData.condition || 'true',
      severity: ruleData.severity || 'info',
      channels: ruleData.channels || ['in-app'],
      autoRemediate: ruleData.autoRemediate || false,
      remediationAction: ruleData.remediationAction || '',
      cooldownMinutes: ruleData.cooldownMinutes || 0,
      enabled: ruleData.enabled !== undefined ? ruleData.enabled : true
    };
    enhancedAlertService.addRule(rule);
    
    res.json({
      success: true,
      message: 'Alert rule created/updated',
      rule,
    });
  } catch (error: any) {
    console.error('Error creating alert rule:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update specific alert rule
router.patch('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    enhancedAlertService.updateRule(id, updates);
    
    res.json({
      success: true,
      message: 'Alert rule updated',
    });
  } catch (error: any) {
    console.error('Error updating alert rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete alert rule
router.delete('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    enhancedAlertService.deleteRule(id);
    
    res.json({
      success: true,
      message: 'Alert rule deleted',
    });
  } catch (error: any) {
    console.error('Error deleting alert rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get alert notification history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = enhancedAlertService.getAlertHistory(hours);
    
    res.json(history);
  } catch (error: any) {
    console.error('Error getting alert history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send manual alert
router.post('/manual', async (req: Request, res: Response) => {
  try {
    const { message, severity = 'info', channels = ['in-app'] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    await enhancedAlertService.manualAlert(message, severity, channels);
    
    res.json({
      success: true,
      message: 'Manual alert sent',
    });
  } catch (error: any) {
    console.error('Error sending manual alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test alert system
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.body;
    
    if (!ruleId) {
      return res.status(400).json({ error: 'Rule ID is required' });
    }
    
    // Create a test alert
    await enhancedAlertService.manualAlert(
      `Test alert for rule: ${ruleId}`,
      'info',
      ['in-app']
    );
    
    res.json({
      success: true,
      message: 'Test alert sent',
    });
  } catch (error: any) {
    console.error('Error testing alert:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;