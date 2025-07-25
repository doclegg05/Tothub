import { db } from '../db';
import { safetyReminders, safetyReminderCompletions, type SafetyReminder, type InsertSafetyReminder, type SafetyReminderCompletion, type InsertSafetyReminderCompletion } from '@shared/schema';
import { eq, and, lte, gte, desc, asc } from 'drizzle-orm';

export class SafetyReminderService {
  // Get all active safety reminders
  static async getAllReminders(): Promise<SafetyReminder[]> {
    return await db.select().from(safetyReminders).where(eq(safetyReminders.isActive, true)).orderBy(asc(safetyReminders.nextDueDate));
  }

  // Get reminders by category
  static async getRemindersByCategory(category: string): Promise<SafetyReminder[]> {
    return await db.select().from(safetyReminders)
      .where(and(eq(safetyReminders.category, category), eq(safetyReminders.isActive, true)))
      .orderBy(asc(safetyReminders.nextDueDate));
  }

  // Get upcoming alerts (due within alert window)
  static async getUpcomingAlerts(): Promise<SafetyReminder[]> {
    const now = new Date();
    
    return await db.select().from(safetyReminders)
      .where(and(
        eq(safetyReminders.isActive, true),
        eq(safetyReminders.isPaused, false),
        lte(safetyReminders.nextDueDate, new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))) // Within 7 days
      ))
      .orderBy(asc(safetyReminders.nextDueDate));
  }

  // Get overdue reminders
  static async getOverdueReminders(): Promise<SafetyReminder[]> {
    const now = new Date();
    
    return await db.select().from(safetyReminders)
      .where(and(
        eq(safetyReminders.isActive, true),
        eq(safetyReminders.isPaused, false),
        lte(safetyReminders.nextDueDate, now)
      ))
      .orderBy(asc(safetyReminders.nextDueDate));
  }

  // Create a new safety reminder
  static async createReminder(reminderData: InsertSafetyReminder): Promise<SafetyReminder> {
    const [newReminder] = await db.insert(safetyReminders).values(reminderData).returning();
    return newReminder;
  }

  // Update a safety reminder
  static async updateReminder(id: string, updates: Partial<InsertSafetyReminder>): Promise<SafetyReminder | null> {
    const [updatedReminder] = await db.update(safetyReminders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safetyReminders.id, id))
      .returning();
    
    return updatedReminder || null;
  }

  // Toggle pause status
  static async togglePauseReminder(id: string): Promise<SafetyReminder | null> {
    const [reminder] = await db.select().from(safetyReminders).where(eq(safetyReminders.id, id));
    
    if (!reminder) return null;

    const [updatedReminder] = await db.update(safetyReminders)
      .set({ isPaused: !reminder.isPaused, updatedAt: new Date() })
      .where(eq(safetyReminders.id, id))
      .returning();
    
    return updatedReminder || null;
  }

  // Deactivate (soft delete) a reminder
  static async deactivateReminder(id: string): Promise<boolean> {
    const [updatedReminder] = await db.update(safetyReminders)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(safetyReminders.id, id))
      .returning();
    
    return !!updatedReminder;
  }

  // Mark a reminder as completed
  static async completeReminder(reminderId: string, completionData: InsertSafetyReminderCompletion): Promise<SafetyReminderCompletion> {
    // Get the reminder to calculate next due date
    const [reminder] = await db.select().from(safetyReminders).where(eq(safetyReminders.id, reminderId));
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    // Calculate next due date based on frequency
    const nextDueDate = this.calculateNextDueDate(reminder.frequency, reminder.customInterval);

    // Create completion record
    const [completion] = await db.insert(safetyReminderCompletions)
      .values({ ...completionData, nextScheduledDate: nextDueDate })
      .returning();

    // Update reminder with new due date and last completed date
    await db.update(safetyReminders)
      .set({ 
        nextDueDate, 
        lastCompletedDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(safetyReminders.id, reminderId));

    return completion;
  }

  // Get completion history for a reminder
  static async getCompletionHistory(reminderId: string): Promise<SafetyReminderCompletion[]> {
    return await db.select().from(safetyReminderCompletions)
      .where(eq(safetyReminderCompletions.reminderId, reminderId))
      .orderBy(desc(safetyReminderCompletions.completedAt));
  }

  // Calculate next due date based on frequency
  static calculateNextDueDate(frequency: string, customInterval?: number | null): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case 'custom':
        if (customInterval) {
          nextDate.setDate(nextDate.getDate() + customInterval);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
        }
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
    }

    return nextDate;
  }

  // Get safety reminder statistics
  static async getStatistics() {
    const totalReminders = await db.select().from(safetyReminders).where(eq(safetyReminders.isActive, true));
    const overdue = await this.getOverdueReminders();
    const upcoming = await this.getUpcomingAlerts();
    const paused = await db.select().from(safetyReminders)
      .where(and(eq(safetyReminders.isActive, true), eq(safetyReminders.isPaused, true)));

    // Get category breakdown
    const categoryStats = await db.select().from(safetyReminders)
      .where(eq(safetyReminders.isActive, true));

    const categories = categoryStats.reduce((acc, reminder) => {
      acc[reminder.category] = (acc[reminder.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalReminders.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      paused: paused.length,
      categoryBreakdown: categories,
    };
  }

  // Get predefined safety reminder templates
  static getTemplates() {
    return [
      {
        title: 'Fire Extinguisher Inspection',
        description: 'Monthly visual inspection of all fire extinguishers',
        category: 'fire_safety',
        frequency: 'monthly',
        priority: 'high',
        alertDaysBefore: 3,
      },
      {
        title: 'Fire Drill Practice',
        description: 'Conduct fire drill with all children and staff',
        category: 'drills',
        frequency: 'monthly',
        priority: 'critical',
        alertDaysBefore: 7,
      },
      {
        title: 'Emergency Exit Light Check',
        description: 'Test emergency exit lights and replace batteries if needed',
        category: 'equipment',
        frequency: 'monthly',
        priority: 'high',
        alertDaysBefore: 3,
      },
      {
        title: 'First Aid Kit Inspection',
        description: 'Check first aid kit supplies and expiration dates',
        category: 'equipment',
        frequency: 'monthly',
        priority: 'high',
        alertDaysBefore: 5,
      },
      {
        title: 'Playground Equipment Safety Check',
        description: 'Visual inspection of playground equipment for damage or wear',
        category: 'inspection',
        frequency: 'weekly',
        priority: 'high',
        alertDaysBefore: 2,
      },
      {
        title: 'Security Camera System Check',
        description: 'Test security cameras and recording systems',
        category: 'equipment',
        frequency: 'weekly',
        priority: 'medium',
        alertDaysBefore: 2,
      },
      {
        title: 'Tornado/Severe Weather Drill',
        description: 'Practice severe weather emergency procedures',
        category: 'drills',
        frequency: 'quarterly',
        priority: 'high',
        alertDaysBefore: 14,
      },
      {
        title: 'Annual Fire Safety Inspection',
        description: 'Professional fire safety inspection by certified inspector',
        category: 'inspection',
        frequency: 'yearly',
        priority: 'critical',
        alertDaysBefore: 30,
      },
      {
        title: 'HVAC Filter Replacement',
        description: 'Replace HVAC filters for air quality',
        category: 'maintenance',
        frequency: 'quarterly',
        priority: 'medium',
        alertDaysBefore: 7,
      },
      {
        title: 'Emergency Contact List Update',
        description: 'Review and update emergency contact information',
        category: 'maintenance',
        frequency: 'quarterly',
        priority: 'medium',
        alertDaysBefore: 14,
      },
    ];
  }
}