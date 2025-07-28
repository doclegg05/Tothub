import { db } from '../db';
import { pgTable, text, timestamp, boolean, json, integer, date } from 'drizzle-orm/pg-core';
import { sql, eq, and, gte, lte, desc } from 'drizzle-orm';
import { addDays, differenceInDays } from 'date-fns';

// Waitlist table
export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childFirstName: text('child_first_name').notNull(),
  childLastName: text('child_last_name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  parentName: text('parent_name').notNull(),
  parentEmail: text('parent_email').notNull(),
  parentPhone: text('parent_phone').notNull(),
  desiredStartDate: date('desired_start_date').notNull(),
  preferredDays: json('preferred_days').$type<string[]>(), // ['monday', 'tuesday', etc.]
  preferredProgram: text('preferred_program'), // 'full-time', 'part-time', 'after-school'
  priority: integer('priority').notNull().default(0), // Higher number = higher priority
  status: text('status').notNull().default('waiting'), // 'waiting', 'offered', 'enrolled', 'declined'
  notes: text('notes'),
  source: text('source'), // 'website', 'phone', 'tour', 'referral'
  referralSource: text('referral_source'),
  tourScheduled: timestamp('tour_scheduled'),
  offerDate: timestamp('offer_date'),
  responseDeadline: timestamp('response_deadline'),
  enrollmentDate: timestamp('enrollment_date'),
  declineReason: text('decline_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Marketing campaigns
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'email', 'social', 'print', 'event'
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'completed'
  startDate: date('start_date'),
  endDate: date('end_date'),
  budget: integer('budget'),
  targetAudience: json('target_audience'), // { ageGroups: [], programs: [], etc. }
  content: json('content'), // Email templates, social posts, etc.
  metrics: json('metrics'), // Opens, clicks, conversions, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Lead tracking
export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  source: text('source').notNull(), // 'website', 'social', 'referral', 'event'
  campaignId: text('campaign_id').references(() => campaigns.id),
  status: text('status').notNull().default('new'), // 'new', 'contacted', 'tour_scheduled', 'waitlisted', 'lost'
  score: integer('score').notNull().default(0), // Lead scoring
  lastContactDate: timestamp('last_contact_date'),
  nextFollowUp: timestamp('next_follow_up'),
  notes: json('notes').$type<Array<{ date: string; note: string; by: string }>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export interface WaitlistEntry {
  position: number;
  child: any;
  estimatedAvailability: Date | null;
  score: number;
}

export class WaitlistService {
  // Add to waitlist with automatic scoring
  static async addToWaitlist(data: any): Promise<{ id: string; position: number }> {
    // Calculate priority score
    const score = this.calculatePriorityScore(data);
    
    const [entry] = await db.insert(waitlist).values({
      ...data,
      priority: score,
      status: 'waiting'
    }).returning();

    const position = await this.getWaitlistPosition(entry.id);
    
    return { id: entry.id, position };
  }

  // Calculate priority score based on various factors
  private static calculatePriorityScore(data: any): number {
    let score = 100;
    
    // Sibling already enrolled: +50
    // Full-time preference: +20
    // Early desired start date: +10-30
    // Referral: +15
    // Tour completed: +25
    
    if (data.hasSibling) score += 50;
    if (data.preferredProgram === 'full-time') score += 20;
    if (data.source === 'referral') score += 15;
    if (data.tourCompleted) score += 25;
    
    // Urgency bonus
    const daysUntilStart = differenceInDays(new Date(data.desiredStartDate), new Date());
    if (daysUntilStart < 30) score += 30;
    else if (daysUntilStart < 60) score += 20;
    else if (daysUntilStart < 90) score += 10;
    
    return score;
  }

  // Get current waitlist with positions
  static async getWaitlist(
    status: string = 'waiting',
    ageGroup?: string
  ): Promise<WaitlistEntry[]> {
    let query = db
      .select()
      .from(waitlist)
      .where(eq(waitlist.status, status))
      .orderBy(desc(waitlist.priority), waitlist.createdAt);

    const entries = await query;
    
    return entries.map((entry, index) => ({
      position: index + 1,
      child: entry,
      estimatedAvailability: this.estimateAvailability(entry, index),
      score: entry.priority
    }));
  }

  // Get waitlist position
  static async getWaitlistPosition(id: string): Promise<number> {
    const entries = await db
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(eq(waitlist.status, 'waiting'))
      .orderBy(desc(waitlist.priority), waitlist.createdAt);
    
    return entries.findIndex(e => e.id === id) + 1;
  }

  // Estimate when a spot might become available
  private static estimateAvailability(entry: any, position: number): Date | null {
    // Simple estimation: ~2 spots per month
    const monthsToWait = Math.ceil(position / 2);
    return addDays(new Date(), monthsToWait * 30);
  }

  // Process waitlist when spot becomes available
  static async processWaitlist(ageGroup: string, spotsAvailable: number = 1): Promise<any[]> {
    const eligible = await db
      .select()
      .from(waitlist)
      .where(
        and(
          eq(waitlist.status, 'waiting'),
          lte(waitlist.desiredStartDate, addDays(new Date(), 30))
        )
      )
      .orderBy(desc(waitlist.priority), waitlist.createdAt)
      .limit(spotsAvailable * 3); // Get 3x candidates

    const offers = [];
    
    for (const candidate of eligible.slice(0, spotsAvailable)) {
      const responseDeadline = addDays(new Date(), 3);
      
      await db.update(waitlist)
        .set({
          status: 'offered',
          offerDate: new Date(),
          responseDeadline,
          updatedAt: new Date()
        })
        .where(eq(waitlist.id, candidate.id));
      
      offers.push({
        ...candidate,
        responseDeadline
      });
    }
    
    return offers;
  }

  // Marketing campaign management
  static async createCampaign(campaignData: any): Promise<string> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign.id;
  }

  // Lead management
  static async captureInquiry(leadData: any): Promise<{ id: string; score: number }> {
    const score = this.scoreInquiry(leadData);
    
    const [lead] = await db.insert(leads).values({
      ...leadData,
      score,
      status: 'new',
      notes: []
    }).returning();
    
    // Auto-schedule follow-up
    if (score > 70) {
      await this.scheduleFollowUp(lead.id, 1); // High priority: follow up tomorrow
    } else if (score > 40) {
      await this.scheduleFollowUp(lead.id, 3); // Medium: in 3 days
    } else {
      await this.scheduleFollowUp(lead.id, 7); // Low: in a week
    }
    
    return { id: lead.id, score };
  }

  // Score lead quality
  private static scoreInquiry(data: any): number {
    let score = 50;
    
    if (data.phone) score += 20; // Provided phone number
    if (data.source === 'referral') score += 30;
    if (data.source === 'tour') score += 25;
    if (data.urgency === 'immediate') score += 20;
    if (data.preferredProgram === 'full-time') score += 10;
    
    return Math.min(score, 100);
  }

  // Schedule follow-up
  static async scheduleFollowUp(leadId: string, daysFromNow: number): Promise<void> {
    await db.update(leads)
      .set({
        nextFollowUp: addDays(new Date(), daysFromNow)
      })
      .where(eq(leads.id, leadId));
  }

  // Get leads requiring follow-up
  static async getFollowUps(): Promise<any[]> {
    return await db
      .select()
      .from(leads)
      .where(
        and(
          lte(leads.nextFollowUp, new Date()),
          eq(leads.status, 'new')
        )
      )
      .orderBy(desc(leads.score));
  }

  // Track conversion metrics
  static async getConversionMetrics(dateRange: { start: Date; end: Date }) {
    const inquiries = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, dateRange.start),
          lte(leads.createdAt, dateRange.end)
        )
      );

    const tours = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, dateRange.start),
          lte(leads.createdAt, dateRange.end),
          eq(leads.status, 'tour_scheduled')
        )
      );

    const enrolled = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(waitlist)
      .where(
        and(
          gte(waitlist.createdAt, dateRange.start),
          lte(waitlist.createdAt, dateRange.end),
          eq(waitlist.status, 'enrolled')
        )
      );

    return {
      totalInquiries: inquiries[0]?.count || 0,
      toursScheduled: tours[0]?.count || 0,
      enrolled: enrolled[0]?.count || 0,
      inquiryToTourRate: tours[0]?.count / inquiries[0]?.count * 100 || 0,
      tourToEnrollmentRate: enrolled[0]?.count / tours[0]?.count * 100 || 0
    };
  }
}