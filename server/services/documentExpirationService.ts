import { db } from '../db';
import { 
  documentTypes, 
  documents, 
  documentReminders, 
  documentRenewals,
  type InsertDocumentType,
  type InsertDocument,
  type InsertDocumentReminder,
  type InsertDocumentRenewal
} from '@shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export class DocumentExpirationService {
  
  // Document Type Management
  static async createDocumentType(data: InsertDocumentType) {
    const [documentType] = await db.insert(documentTypes).values(data).returning();
    return documentType;
  }

  static async getAllDocumentTypes() {
    return await db.select().from(documentTypes).orderBy(asc(documentTypes.category), asc(documentTypes.name));
  }

  static async getDocumentTypesByCategory(category: string) {
    return await db.select().from(documentTypes).where(eq(documentTypes.category, category));
  }

  // Document Management
  static async createDocument(data: InsertDocument) {
    const [document] = await db.insert(documents).values({
      ...data,
      updatedBy: data.createdBy,
    }).returning();
    
    // Create initial reminder
    await this.createExpirationReminders(document.id);
    
    return document;
  }

  static async getAllDocuments() {
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        issueDate: documents.issueDate,
        expirationDate: documents.expirationDate,
        status: documents.status,
        documentNumber: documents.documentNumber,
        issuingAuthority: documents.issuingAuthority,
        contactInfo: documents.contactInfo,
        filePath: documents.filePath,
        lastReminderSent: documents.lastReminderSent,
        isActive: documents.isActive,
        createdBy: documents.createdBy,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        documentType: {
          id: documentTypes.id,
          name: documentTypes.name,
          category: documentTypes.category,
          isRequired: documentTypes.isRequired,
          alertDaysBefore: documentTypes.alertDaysBefore,
        }
      })
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(eq(documents.isActive, true))
      .orderBy(asc(documents.expirationDate));
  }

  static async getDocumentsByCategory(category: string) {
    return await db
      .select()
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(and(
        eq(documents.isActive, true),
        eq(documentTypes.category, category)
      ))
      .orderBy(asc(documents.expirationDate));
  }

  static async getExpiringDocuments(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await db
      .select({
        id: documents.id,
        title: documents.title,
        expirationDate: documents.expirationDate,
        status: documents.status,
        documentNumber: documents.documentNumber,
        issuingAuthority: documents.issuingAuthority,
        contactInfo: documents.contactInfo,
        documentType: {
          name: documentTypes.name,
          category: documentTypes.category,
          alertDaysBefore: documentTypes.alertDaysBefore,
        }
      })
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(and(
        eq(documents.isActive, true),
        lte(documents.expirationDate, futureDate),
        gte(documents.expirationDate, new Date())
      ))
      .orderBy(asc(documents.expirationDate));
  }

  static async getExpiredDocuments() {
    return await db
      .select()
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(and(
        eq(documents.isActive, true),
        lte(documents.expirationDate, new Date())
      ))
      .orderBy(desc(documents.expirationDate));
  }

  static async updateDocument(id: string, data: Partial<InsertDocument>) {
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    
    return updatedDocument;
  }

  static async renewDocument(documentId: string, newExpirationDate: Date, renewalData: Partial<InsertDocumentRenewal>) {
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    if (!document.length) throw new Error('Document not found');
    
    const previousExpirationDate = document[0].expirationDate;
    
    // Update document with new expiration date
    await db
      .update(documents)
      .set({
        expirationDate: newExpirationDate,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
    
    // Create renewal record
    const [renewal] = await db.insert(documentRenewals).values({
      documentId,
      previousExpirationDate,
      newExpirationDate,
      renewalDate: new Date(),
      ...renewalData,
    }).returning();
    
    // Create new expiration reminders
    await this.createExpirationReminders(documentId);
    
    return renewal;
  }

  // Reminder Management
  static async createExpirationReminders(documentId: string) {
    const document = await db
      .select({
        document: documents,
        documentType: documentTypes,
      })
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(eq(documents.id, documentId))
      .limit(1);
    
    if (!document.length) throw new Error('Document not found');
    
    const { document: doc, documentType } = document[0];
    const alertDays = documentType?.alertDaysBefore || 30;
    
    // Create reminders at different intervals
    const reminderIntervals = [
      { days: alertDays, type: 'expiration_warning', priority: 'medium' },
      { days: 7, type: 'renewal_required', priority: 'high' },
      { days: 1, type: 'renewal_required', priority: 'critical' },
    ];
    
    for (const interval of reminderIntervals) {
      if (interval.days <= alertDays) {
        const reminderDate = new Date(doc.expirationDate);
        reminderDate.setDate(reminderDate.getDate() - interval.days);
        
        if (reminderDate > new Date()) {
          await db.insert(documentReminders).values({
            documentId,
            reminderType: interval.type as any,
            reminderDate,
            message: `${documentType?.name || doc.title} expires in ${interval.days} day${interval.days > 1 ? 's' : ''}`,
            priority: interval.priority as any,
          });
        }
      }
    }
  }

  static async getPendingReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db
      .select({
        id: documentReminders.id,
        reminderType: documentReminders.reminderType,
        reminderDate: documentReminders.reminderDate,
        message: documentReminders.message,
        priority: documentReminders.priority,
        document: {
          id: documents.id,
          title: documents.title,
          expirationDate: documents.expirationDate,
          documentNumber: documents.documentNumber,
          issuingAuthority: documents.issuingAuthority,
        },
        documentType: {
          name: documentTypes.name,
          category: documentTypes.category,
        }
      })
      .from(documentReminders)
      .leftJoin(documents, eq(documentReminders.documentId, documents.id))
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(and(
        eq(documentReminders.isActive, true),
        eq(documents.isActive, true),
        gte(documentReminders.reminderDate, today),
        lte(documentReminders.reminderDate, tomorrow),
        sql`${documentReminders.sentAt} IS NULL`
      ))
      .orderBy(asc(documentReminders.reminderDate), desc(documentReminders.priority));
  }

  static async markReminderSent(reminderId: string) {
    await db
      .update(documentReminders)
      .set({ sentAt: new Date() })
      .where(eq(documentReminders.id, reminderId));
  }

  static async acknowledgeReminder(reminderId: string, acknowledgedBy: string) {
    await db
      .update(documentReminders)
      .set({ 
        acknowledgedAt: new Date(),
        acknowledgedBy,
      })
      .where(eq(documentReminders.id, reminderId));
  }

  // Statistics and Reports
  static async getStatistics() {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    
    const totalActive = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(eq(documents.isActive, true)));
    
    const expired = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        eq(documents.isActive, true),
        lte(documents.expirationDate, today)
      ));
    
    const expiringSoon = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        eq(documents.isActive, true),
        gte(documents.expirationDate, today),
        lte(documents.expirationDate, in30Days)
      ));
    
    const byCategory = await db
      .select({
        category: documentTypes.category,
        count: sql<number>`count(*)`,
      })
      .from(documents)
      .leftJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .where(eq(documents.isActive, true))
      .groupBy(documentTypes.category);
    
    return {
      total: totalActive[0]?.count || 0,
      expired: expired[0]?.count || 0,
      expiringSoon: expiringSoon[0]?.count || 0,
      categoryBreakdown: byCategory.reduce((acc, item) => {
        if (item.category) {
          acc[item.category] = item.count;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Predefined document templates
  static getDocumentTemplates() {
    return [
      {
        name: 'General Liability Insurance',
        category: 'insurance',
        description: 'Comprehensive general liability coverage for daycare operations',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 60,
        regulatoryBody: 'Insurance Provider',
        complianceNotes: 'Minimum $2M coverage required for childcare facilities',
      },
      {
        name: 'Professional Liability Insurance',
        category: 'insurance',
        description: 'Professional liability and errors & omissions coverage',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 60,
        regulatoryBody: 'Insurance Provider',
        complianceNotes: 'Covers professional decisions and educational activities',
      },
      {
        name: 'Cyber Liability Insurance',
        category: 'insurance',
        description: 'Coverage for data breaches and cyber security incidents',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 45,
        regulatoryBody: 'Insurance Provider',
        complianceNotes: 'Required for facilities handling sensitive data and biometrics',
      },
      {
        name: 'Childcare License',
        category: 'license',
        description: 'State-issued childcare facility operating license',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 90,
        regulatoryBody: 'State Department of Children Services',
        complianceNotes: 'Must be renewed annually with inspection requirements',
      },
      {
        name: 'Fire Safety Certificate',
        category: 'certification',
        description: 'Fire department safety inspection certificate',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 45,
        regulatoryBody: 'Local Fire Department',
        complianceNotes: 'Annual fire safety inspection required',
      },
      {
        name: 'Health Department Permit',
        category: 'certification',
        description: 'Health department food service and facility permit',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 60,
        regulatoryBody: 'County Health Department',
        complianceNotes: 'Required for food service and health compliance',
      },
      {
        name: 'COPPA Privacy Policy',
        category: 'legal',
        description: 'Children\'s Online Privacy Protection Act compliance documentation',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 30,
        regulatoryBody: 'Federal Trade Commission',
        complianceNotes: 'Must be reviewed and updated annually for legal compliance',
      },
      {
        name: 'Biometric Consent Forms',
        category: 'legal',
        description: 'Parent consent forms for biometric data collection',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 30,
        regulatoryBody: 'State Privacy Authority',
        complianceNotes: 'Required for fingerprint and facial recognition systems',
      },
      {
        name: 'Data Processing Agreement',
        category: 'legal',
        description: 'GDPR/CCPA compliant data processing documentation',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 45,
        regulatoryBody: 'Privacy Regulatory Body',
        complianceNotes: 'Required for handling personal and sensitive data',
      },
      {
        name: 'Workers Compensation Insurance',
        category: 'insurance',
        description: 'Workers compensation coverage for all employees',
        isRequired: true,
        renewalFrequency: 'yearly',
        alertDaysBefore: 60,
        regulatoryBody: 'State Workers Compensation Board',
        complianceNotes: 'Mandatory coverage for all childcare employees',
      },
    ];
  }
}