import crypto from 'crypto';

interface ZapierWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

interface ZapierEvent {
  event: string;
  data: any;
  timestamp: string;
  childId?: string;
  staffId?: string;
}

export class ZapierService {
  private webhooks: Map<string, ZapierWebhook> = new Map();
  
  constructor() {
    // Initialize with some common webhook configurations
    this.setupDefaultWebhooks();
  }

  private setupDefaultWebhooks() {
    // These would typically be configured through the admin interface
    const defaultWebhooks: ZapierWebhook[] = [
      {
        id: 'child-checkin',
        name: 'Child Check-in Notification',
        url: '', // User will configure this in Zapier
        events: ['child.checkin', 'child.checkout'],
        active: false
      },
      {
        id: 'payment-processing',
        name: 'Payment Processing',
        url: '',
        events: ['payment.succeeded', 'payment.failed', 'invoice.created'],
        active: false
      },
      {
        id: 'staff-alerts',
        name: 'Staff Alerts',
        url: '',
        events: ['staff.late', 'ratio.violation', 'emergency.alert'],
        active: false
      },
      {
        id: 'daily-reports',
        name: 'Daily Reports',
        url: '',
        events: ['report.daily', 'report.weekly'],
        active: false
      }
    ];

    defaultWebhooks.forEach(webhook => {
      this.webhooks.set(webhook.id, webhook);
    });
  }

  // Register a new webhook
  registerWebhook(webhook: Omit<ZapierWebhook, 'id'>): string {
    const id = crypto.randomUUID();
    const newWebhook: ZapierWebhook = {
      ...webhook,
      id,
      secret: crypto.randomBytes(32).toString('hex')
    };
    
    this.webhooks.set(id, newWebhook);
    return id;
  }

  // Update webhook configuration
  updateWebhook(id: string, updates: Partial<ZapierWebhook>): boolean {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;

    this.webhooks.set(id, { ...webhook, ...updates });
    return true;
  }

  // Delete webhook
  deleteWebhook(id: string): boolean {
    return this.webhooks.delete(id);
  }

  // Get all webhooks
  getWebhooks(): ZapierWebhook[] {
    return Array.from(this.webhooks.values());
  }

  // Get webhook by ID
  getWebhook(id: string): ZapierWebhook | undefined {
    return this.webhooks.get(id);
  }

  // Trigger webhook for specific event
  async triggerEvent(event: string, data: any, options: { childId?: string; staffId?: string } = {}) {
    const relevantWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.active && webhook.events.includes(event) && webhook.url);

    if (relevantWebhooks.length === 0) {
      console.log(`No active webhooks found for event: ${event}`);
      return;
    }

    const zapierEvent: ZapierEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      ...options
    };

    // Send to all relevant webhooks
    const promises = relevantWebhooks.map(webhook => this.sendWebhook(webhook, zapierEvent));
    
    try {
      await Promise.allSettled(promises);
      console.log(`✅ Zapier event '${event}' sent to ${relevantWebhooks.length} webhook(s)`);
    } catch (error) {
      console.error(`❌ Error sending Zapier event '${event}':`, error);
    }
  }

  // Send webhook to Zapier
  private async sendWebhook(webhook: ZapierWebhook, event: ZapierEvent): Promise<void> {
    try {
      const payload = {
        ...event,
        webhook_id: webhook.id,
        webhook_name: webhook.name
      };

      const signature = webhook.secret 
        ? this.generateSignature(JSON.stringify(payload), webhook.secret)
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'TotHub-Zapier/1.0'
      };

      if (signature) {
        headers['X-TotHub-Signature'] = signature;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`📤 Webhook '${webhook.name}' sent successfully`);
    } catch (error) {
      console.error(`❌ Failed to send webhook '${webhook.name}':`, error);
      throw error;
    }
  }

  // Generate HMAC signature for webhook security
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // Verify webhook signature (for incoming webhooks from Zapier)
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Common automation triggers
  async triggerChildCheckin(childData: any) {
    await this.triggerEvent('child.checkin', {
      child_id: childData.id,
      child_name: `${childData.firstName} ${childData.lastName}`,
      check_in_time: new Date().toISOString(),
      room: childData.room,
      parent_name: childData.parentName,
      parent_email: childData.parentEmail
    }, { childId: childData.id });
  }

  async triggerChildCheckout(childData: any) {
    await this.triggerEvent('child.checkout', {
      child_id: childData.id,
      child_name: `${childData.firstName} ${childData.lastName}`,
      check_out_time: new Date().toISOString(),
      room: childData.room,
      parent_name: childData.parentName,
      parent_email: childData.parentEmail
    }, { childId: childData.id });
  }

  async triggerPaymentSuccess(paymentData: any) {
    await this.triggerEvent('payment.succeeded', {
      payment_id: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      child_id: paymentData.childId,
      parent_email: paymentData.parentEmail,
      payment_method: paymentData.paymentMethod
    }, { childId: paymentData.childId });
  }

  async triggerStaffAlert(alertData: any) {
    await this.triggerEvent('staff.alert', {
      alert_type: alertData.type,
      message: alertData.message,
      severity: alertData.severity,
      staff_id: alertData.staffId,
      timestamp: new Date().toISOString()
    }, { staffId: alertData.staffId });
  }

  async triggerDailyReport(reportData: any) {
    await this.triggerEvent('report.daily', {
      date: reportData.date,
      total_children: reportData.totalChildren,
      total_staff: reportData.totalStaff,
      incidents: reportData.incidents,
      highlights: reportData.highlights,
      summary: reportData.summary
    });
  }
}

// Export singleton instance
export const zapierService = new ZapierService();