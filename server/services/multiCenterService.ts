import { db } from '../db';
import { sql, eq, and, inArray } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';

// Define center-related tables
export const centers = pgTable('centers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  licenseNumber: text('license_number'),
  capacity: integer('capacity').notNull().default(50),
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const centerStaff = pgTable('center_staff', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  centerId: text('center_id').notNull().references(() => centers.id),
  staffId: text('staff_id').notNull(),
  isPrimary: boolean('is_primary').notNull().default(true),
  role: text('role').notNull(), // 'director', 'assistant_director', 'teacher', etc.
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
});

export interface CenterStats {
  centerId: string;
  centerName: string;
  totalChildren: number;
  totalStaff: number;
  currentAttendance: number;
  revenue: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
}

export interface CenterTransfer {
  childId: string;
  fromCenterId: string;
  toCenterId: string;
  transferDate: Date;
  reason: string;
}

export class MultiCenterService {
  // Get all centers in the organization
  static async getAllCenters() {
    return await db.select().from(centers).where(eq(centers.isActive, true));
  }

  // Get center details with stats
  static async getCenterDetails(centerId: string): Promise<CenterStats | null> {
    const [center] = await db.select().from(centers).where(eq(centers.id, centerId)).limit(1);
    
    if (!center) return null;

    // Mock stats - would aggregate from actual data
    return {
      centerId: center.id,
      centerName: center.name,
      totalChildren: 45, // Would count from children table with centerId
      totalStaff: 12, // Would count from centerStaff
      currentAttendance: 38, // Would count today's attendance
      revenue: 54000, // Would sum from billing
      complianceStatus: 'compliant'
    };
  }

  // Get aggregated stats across all centers
  static async getOrganizationStats(): Promise<{
    totalCenters: number;
    totalChildren: number;
    totalStaff: number;
    totalRevenue: number;
    centersWithIssues: number;
  }> {
    const activeCenters = await this.getAllCenters();
    
    // Mock aggregated data - would be calculated from actual tables
    return {
      totalCenters: activeCenters.length,
      totalChildren: 245,
      totalStaff: 68,
      totalRevenue: 294000,
      centersWithIssues: 1
    };
  }

  // Transfer child between centers
  static async transferChild(transfer: CenterTransfer): Promise<boolean> {
    try {
      // In a real implementation:
      // 1. Update child's centerId
      // 2. Create transfer record
      // 3. Notify both centers
      // 4. Update attendance records
      
      console.log('Processing transfer:', transfer);
      return true;
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    }
  }

  // Share staff between centers
  static async assignStaffToCenter(
    staffId: string, 
    centerId: string, 
    role: string,
    isPrimary: boolean = false
  ): Promise<boolean> {
    try {
      await db.insert(centerStaff).values({
        staffId,
        centerId,
        role,
        isPrimary,
        startDate: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Staff assignment failed:', error);
      return false;
    }
  }

  // Generate cross-center report
  static async generateCrossCenter Report(
    centerIds: string[],
    reportType: 'attendance' | 'revenue' | 'compliance' | 'staff'
  ): Promise<any> {
    const centers = await db
      .select()
      .from(centers)
      .where(inArray(centers.id, centerIds));

    const report = {
      reportType,
      generatedAt: new Date(),
      centers: centers.map(c => c.name),
      data: {} as any
    };

    switch (reportType) {
      case 'attendance':
        // Mock attendance comparison
        report.data = {
          averageAttendance: {
            'Center A': 85,
            'Center B': 92,
            'Center C': 78
          },
          trend: 'increasing'
        };
        break;

      case 'revenue':
        // Mock revenue comparison
        report.data = {
          monthlyRevenue: {
            'Center A': 98000,
            'Center B': 120000,
            'Center C': 76000
          },
          collectionRate: 94
        };
        break;

      case 'compliance':
        // Mock compliance status
        report.data = {
          complianceScore: {
            'Center A': 98,
            'Center B': 95,
            'Center C': 88
          },
          issues: ['Center C: Ratio violation on 1/24']
        };
        break;

      case 'staff':
        // Mock staff utilization
        report.data = {
          staffCount: {
            'Center A': 22,
            'Center B': 28,
            'Center C': 18
          },
          utilizationRate: 89
        };
        break;
    }

    return report;
  }

  // Sync settings across centers
  static async syncSettings(
    sourceCenterId: string,
    targetCenterIds: string[],
    settingTypes: ('ratios' | 'policies' | 'schedules')[]
  ): Promise<{ synced: number; failed: number }> {
    const [sourceCenter] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, sourceCenterId))
      .limit(1);

    if (!sourceCenter || !sourceCenter.settings) {
      return { synced: 0, failed: targetCenterIds.length };
    }

    let synced = 0;
    let failed = 0;

    for (const targetId of targetCenterIds) {
      try {
        const settings = sourceCenter.settings as any;
        const syncedSettings: any = {};

        // Copy only requested setting types
        settingTypes.forEach(type => {
          if (settings[type]) {
            syncedSettings[type] = settings[type];
          }
        });

        await db
          .update(centers)
          .set({ 
            settings: sql`jsonb_merge(settings, ${JSON.stringify(syncedSettings)}::jsonb)`,
            updatedAt: new Date()
          })
          .where(eq(centers.id, targetId));

        synced++;
      } catch (error) {
        console.error(`Failed to sync to center ${targetId}:`, error);
        failed++;
      }
    }

    return { synced, failed };
  }

  // Get staff shared across multiple centers
  static async getSharedStaff(): Promise<any[]> {
    // Query staff assigned to multiple centers
    const sharedStaff = await db
      .select({
        staffId: centerStaff.staffId,
        centerCount: sql<number>`COUNT(DISTINCT ${centerStaff.centerId})`,
        centers: sql<string[]>`ARRAY_AGG(${centers.name})`
      })
      .from(centerStaff)
      .innerJoin(centers, eq(centerStaff.centerId, centers.id))
      .groupBy(centerStaff.staffId)
      .having(sql`COUNT(DISTINCT ${centerStaff.centerId}) > 1`);

    return sharedStaff;
  }
}