import { Router } from 'express';
import { DocumentExpirationService } from '../services/documentExpirationService';
import { 
  insertDocumentTypeSchema, 
  insertDocumentSchema, 
  insertDocumentReminderSchema,
  insertDocumentRenewalSchema
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Document Type Routes
router.get('/types', async (req, res) => {
  try {
    const documentTypes = await DocumentExpirationService.getAllDocumentTypes();
    res.json(documentTypes);
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

router.get('/types/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const documentTypes = await DocumentExpirationService.getDocumentTypesByCategory(category);
    res.json(documentTypes);
  } catch (error) {
    console.error('Error fetching document types by category:', error);
    res.status(500).json({ error: 'Failed to fetch document types by category' });
  }
});

router.post('/types', async (req, res) => {
  try {
    const documentTypeData = insertDocumentTypeSchema.parse(req.body);
    const newDocumentType = await DocumentExpirationService.createDocumentType(documentTypeData);
    res.status(201).json(newDocumentType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid document type data', details: error.errors });
    }
    console.error('Error creating document type:', error);
    res.status(500).json({ error: 'Failed to create document type' });
  }
});

// Document Routes
router.get('/documents', async (req, res) => {
  try {
    const documents = await DocumentExpirationService.getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/documents/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const documents = await DocumentExpirationService.getDocumentsByCategory(category);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    res.status(500).json({ error: 'Failed to fetch documents by category' });
  }
});

router.get('/documents/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const expiringDocuments = await DocumentExpirationService.getExpiringDocuments(days);
    res.json(expiringDocuments);
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    res.status(500).json({ error: 'Failed to fetch expiring documents' });
  }
});

router.get('/documents/expired', async (req, res) => {
  try {
    const expiredDocuments = await DocumentExpirationService.getExpiredDocuments();
    res.json(expiredDocuments);
  } catch (error) {
    console.error('Error fetching expired documents:', error);
    res.status(500).json({ error: 'Failed to fetch expired documents' });
  }
});

router.post('/documents', async (req, res) => {
  try {
    const documentData = insertDocumentSchema.parse(req.body);
    const newDocument = await DocumentExpirationService.createDocument(documentData);
    res.status(201).json(newDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid document data', details: error.errors });
    }
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

router.put('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertDocumentSchema.partial().parse(req.body);
    const updatedDocument = await DocumentExpirationService.updateDocument(id, updateData);
    
    if (!updatedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid update data', details: error.errors });
    }
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

router.post('/documents/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const { newExpirationDate, cost, notes, processedBy } = req.body;
    
    const renewal = await DocumentExpirationService.renewDocument(
      id,
      new Date(newExpirationDate),
      { cost, notes, processedBy }
    );
    
    res.json(renewal);
  } catch (error) {
    console.error('Error renewing document:', error);
    res.status(500).json({ error: 'Failed to renew document' });
  }
});

// Reminder Routes
router.get('/reminders/pending', async (req, res) => {
  try {
    const pendingReminders = await DocumentExpirationService.getPendingReminders();
    res.json(pendingReminders);
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({ error: 'Failed to fetch pending reminders' });
  }
});

router.post('/reminders/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;
    
    await DocumentExpirationService.acknowledgeReminder(id, acknowledgedBy || 'admin');
    res.json({ message: 'Reminder acknowledged successfully' });
  } catch (error) {
    console.error('Error acknowledging reminder:', error);
    res.status(500).json({ error: 'Failed to acknowledge reminder' });
  }
});

router.post('/reminders/:id/mark-sent', async (req, res) => {
  try {
    const { id } = req.params;
    
    await DocumentExpirationService.markReminderSent(id);
    res.json({ message: 'Reminder marked as sent' });
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    res.status(500).json({ error: 'Failed to mark reminder as sent' });
  }
});

// Statistics and Templates
router.get('/statistics', async (req, res) => {
  try {
    const stats = await DocumentExpirationService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = DocumentExpirationService.getDocumentTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching document templates:', error);
    res.status(500).json({ error: 'Failed to fetch document templates' });
  }
});

export default router;