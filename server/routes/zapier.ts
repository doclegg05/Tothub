import express from 'express';
import { authMiddleware as authenticateToken } from '../middleware/auth';
import { zapierService } from '../services/zapierService';
import { z } from 'zod';

const router = express.Router();

// Webhook registration schema
const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()),
  active: z.boolean().default(true)
});

// Get all webhooks
router.get('/webhooks', authenticateToken, (req, res) => {
  try {
    const webhooks = zapierService.getWebhooks();
    res.json({ webhooks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get webhook by ID
router.get('/webhooks/:id', authenticateToken, (req, res) => {
  try {
    const webhook = zapierService.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json({ webhook });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register new webhook
router.post('/webhooks', authenticateToken, (req, res) => {
  try {
    const webhookData = webhookSchema.parse(req.body);
    const webhookId = zapierService.registerWebhook(webhookData);
    const webhook = zapierService.getWebhook(webhookId);
    
    res.status(201).json({ 
      message: 'Webhook registered successfully',
      webhook 
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid webhook data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update webhook
router.put('/webhooks/:id', authenticateToken, (req, res) => {
  try {
    const updates = webhookSchema.partial().parse(req.body);
    const success = zapierService.updateWebhook(req.params.id, updates);
    
    if (!success) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    const webhook = zapierService.getWebhook(req.params.id);
    res.json({ 
      message: 'Webhook updated successfully',
      webhook 
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid webhook data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete webhook
router.delete('/webhooks/:id', authenticateToken, (req, res) => {
  try {
    const success = zapierService.deleteWebhook(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test webhook endpoint
router.post('/webhooks/:id/test', authenticateToken, async (req, res) => {
  try {
    const webhook = zapierService.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Send test event
    await zapierService.triggerEvent('test.event', {
      message: 'This is a test event from TotHub',
      timestamp: new Date().toISOString(),
      test: true
    });

    res.json({ message: 'Test webhook sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get available events
router.get('/events', authenticateToken, (req, res) => {
  const availableEvents = [
    {
      name: 'child.checkin',
      description: 'Triggered when a child checks in',
      data: {
        child_id: 'string',
        child_name: 'string',
        check_in_time: 'ISO string',
        room: 'string',
        parent_name: 'string',
        parent_email: 'string'
      }
    },
    {
      name: 'child.checkout',
      description: 'Triggered when a child checks out',
      data: {
        child_id: 'string',
        child_name: 'string',
        check_out_time: 'ISO string',
        room: 'string',
        parent_name: 'string',
        parent_email: 'string'
      }
    },
    {
      name: 'payment.succeeded',
      description: 'Triggered when a payment is successful',
      data: {
        payment_id: 'string',
        amount: 'number',
        currency: 'string',
        child_id: 'string',
        parent_email: 'string',
        payment_method: 'string'
      }
    },
    {
      name: 'payment.failed',
      description: 'Triggered when a payment fails',
      data: {
        payment_id: 'string',
        amount: 'number',
        error_message: 'string',
        child_id: 'string',
        parent_email: 'string'
      }
    },
    {
      name: 'staff.late',
      description: 'Triggered when staff is late',
      data: {
        staff_id: 'string',
        staff_name: 'string',
        scheduled_time: 'ISO string',
        actual_time: 'ISO string',
        delay_minutes: 'number'
      }
    },
    {
      name: 'ratio.violation',
      description: 'Triggered when staff-to-child ratio is violated',
      data: {
        room: 'string',
        current_ratio: 'string',
        required_ratio: 'string',
        children_count: 'number',
        staff_count: 'number'
      }
    },
    {
      name: 'report.daily',
      description: 'Triggered for daily reports',
      data: {
        date: 'string',
        total_children: 'number',
        total_staff: 'number',
        incidents: 'array',
        highlights: 'array',
        summary: 'string'
      }
    }
  ];

  res.json({ events: availableEvents });
});

// Incoming webhook from Zapier (for two-way integration)
router.post('/incoming/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhook = zapierService.getWebhook(webhookId);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify signature if secret is configured
    if (webhook.secret) {
      const signature = req.headers['x-tothub-signature'] as string;
      const payload = JSON.stringify(req.body);
      
      if (!signature || !zapierService.verifySignature(payload, signature, webhook.secret)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Process incoming webhook data
    console.log(`📥 Incoming Zapier webhook '${webhook.name}':`, req.body);
    
    // Here you can add logic to process incoming data from Zapier
    // For example: create alerts, update records, trigger notifications, etc.
    
    res.json({ message: 'Webhook received successfully' });
  } catch (error: any) {
    console.error('Error processing incoming webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;