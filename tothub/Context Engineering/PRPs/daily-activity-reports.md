# PRP: Automated Daily Activity Reports for Parents

## Goal
Create an automated system that sends comprehensive daily activity reports to parents at 5 PM local time, including their child's activities, meals, naps, mood tracking, photos, and teacher notes in a beautifully formatted email.

## Why
- **Business Value**: Increases parent engagement and satisfaction
- **Trust Building**: Daily transparency builds confidence in daycare services  
- **Time Savings**: Automates manual communication between teachers and parents
- **Differentiation**: Premium feature that sets TotHub apart from competitors

## What
An automated reporting system that:
- Aggregates daily data from multiple sources (attendance, activities, meals, photos)
- Generates beautiful HTML email reports with responsive design
- Sends reports at 5 PM local time respecting parent preferences
- Tracks delivery status and allows manual resending
- Enables two-way communication between parents and teachers

### Success Criteria
- [ ] Daily reports generated and sent at 5 PM local time
- [ ] Reports include all activity data, photos, and mood tracking
- [ ] Emails are mobile-responsive and visually appealing
- [ ] Parents can opt-out or customize preferences
- [ ] Delivery tracking with retry mechanism
- [ ] Teachers can add personalized notes
- [ ] All tests pass and memory usage remains stable

## Context & Documentation

### Existing Patterns to Follow
```typescript
// Email Service Pattern (server/services/emailService.ts)
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Storage Pattern (server/storage.ts)
async getChildActivities(childId: string, date: Date): Promise<Activity[]>

// Scheduled Jobs Pattern (server/services/schedulingService.ts)
scheduleRecurring(cronExpression: string, task: () => Promise<void>)
```

### Database Schema Extensions Needed
```typescript
// Add to shared/schema.ts
export const dailyReports = pgTable('daily_reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  date: date('date').notNull(),
  sentAt: timestamp('sent_at'),
  emailStatus: text('email_status').notNull().default('pending'), // pending, sent, failed
  emailMessageId: text('email_message_id'),
  reportData: jsonb('report_data').notNull(), // Cached report content
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teacherNotes = pgTable('teacher_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  staffId: text('staff_id').notNull().references(() => staff.id),
  date: date('date').notNull(),
  note: text('note').notNull(),
  category: text('category'), // behavior, learning, health, general
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### SendGrid Email Template Structure
```html
<!-- Mobile-responsive template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <!-- Header with child photo and name -->
  <!-- Summary stats (hours attended, mood, activities) -->
  <!-- Timeline of day's events -->
  <!-- Photo gallery -->
  <!-- Teacher's notes -->
  <!-- Reply CTA button -->
</div>
```

## Implementation Blueprint

### Phase 1: Database Schema & Storage Layer
1. Add `dailyReports` and `teacherNotes` tables to schema
2. Run database migration with `npm run db:push`
3. Extend storage interface with new methods:
   - `createDailyReport()`
   - `getDailyReport()`
   - `addTeacherNote()`
   - `getChildDayData()` - aggregates all data for a child's day

### Phase 2: Daily Report Service
```typescript
// server/services/dailyReportService.ts
export class DailyReportService {
  // Aggregate all daily data for a child
  static async generateDailyReport(childId: string, date: Date) {
    const [attendance, activities, meals, photos, mood, notes] = await Promise.all([
      storage.getChildAttendance(childId, date),
      storage.getChildActivities(childId, date),
      storage.getChildMeals(childId, date),
      storage.getChildPhotos(childId, date),
      storage.getChildMoodData(childId, date),
      storage.getTeacherNotes(childId, date)
    ]);
    
    return {
      attendance,
      totalHours: calculateHours(attendance),
      activities: groupActivitiesByType(activities),
      meals,
      photos: photos.slice(0, 6), // Limit to 6 photos
      averageMood: calculateAverageMood(mood),
      teacherNotes: notes,
      milestones: extractMilestones(activities)
    };
  }

  // Generate HTML email from report data
  static async generateEmailHTML(report: DailyReport, child: Child) {
    return emailTemplate({ report, child });
  }

  // Send report via SendGrid
  static async sendDailyReport(childId: string, date: Date) {
    const child = await storage.getChild(childId);
    if (!child.parentEmail || !child.enableDailyReports) return;

    const report = await this.generateDailyReport(childId, date);
    const html = await this.generateEmailHTML(report, child);

    const msg = {
      to: child.parentEmail,
      from: process.env.FROM_EMAIL!,
      subject: `${child.firstName}'s Day at TotHub - ${format(date, 'MMMM d')}`,
      html,
      trackingSettings: { clickTracking: { enable: true } }
    };

    const [response] = await sgMail.send(msg);
    
    await storage.createDailyReport({
      childId,
      date,
      sentAt: new Date(),
      emailStatus: 'sent',
      emailMessageId: response.headers['x-message-id'],
      reportData: report
    });
  }
}
```

### Phase 3: Scheduled Job Setup
```typescript
// server/services/cronJobs.ts
import cron from 'node-cron';

export function initializeDailyReportsCron() {
  // Run at 5 PM every day
  cron.schedule('0 17 * * *', async () => {
    console.log('Starting daily reports generation...');
    
    const presentToday = await storage.getPresentChildrenForDate(new Date());
    
    // Process in batches to avoid memory issues
    for (const batch of chunk(presentToday, 10)) {
      await Promise.all(
        batch.map(attendance => 
          DailyReportService.sendDailyReport(attendance.childId, new Date())
            .catch(err => console.error(`Failed to send report for ${attendance.childId}:`, err))
        )
      );
    }
  });
}
```

### Phase 4: Teacher Notes UI
```typescript
// client/src/components/teacher-notes.tsx
export function TeacherNotesPanel({ childId }: { childId: string }) {
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('general');
  
  const mutation = useMutation({
    mutationFn: async (data: TeacherNote) => 
      apiRequest('/api/teacher-notes', 'POST', data),
    onSuccess: () => {
      toast({ title: 'Note added successfully' });
      setNote('');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Daily Note</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Share something special about their day..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="behavior">Behavior</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={() => mutation.mutate({ childId, note, category })}
          disabled={!note.trim()}
        >
          Add Note
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Phase 5: API Endpoints
```typescript
// Add to server routes
// Teacher notes
app.post('/api/teacher-notes', authMiddleware, async (req, res) => {
  const { childId, note, category } = req.body;
  const staffId = req.user.id;
  
  const result = await storage.addTeacherNote({
    childId,
    staffId,
    note,
    category,
    date: new Date()
  });
  
  res.json(result);
});

// Manual report sending
app.post('/api/daily-reports/send', authMiddleware, async (req, res) => {
  const { childId, date } = req.body;
  
  await DailyReportService.sendDailyReport(childId, new Date(date));
  
  res.json({ success: true });
});

// Report status
app.get('/api/daily-reports/:childId/:date', authMiddleware, async (req, res) => {
  const report = await storage.getDailyReport(
    req.params.childId, 
    new Date(req.params.date)
  );
  
  res.json(report);
});
```

## Validation Gates

```bash
# 1. Database schema validation
npm run db:push

# 2. TypeScript compilation
npm run build

# 3. Test email sending (development)
curl -X POST http://localhost:5000/api/daily-reports/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"childId": "test-child-id", "date": "2025-01-28"}'

# 4. Verify cron job registration
grep "Daily reports cron job initialized" server.log

# 5. Check memory usage doesn't increase
curl http://localhost:5000/api/memory-stats
```

## Error Handling Strategy
- Wrap all SendGrid calls in try-catch with retry logic
- Log failed emails to database for manual retry
- Respect rate limits with exponential backoff
- Handle missing data gracefully (empty sections)
- Validate parent email before sending
- Check child enrollment status

## Performance Considerations
- Process reports in batches of 10
- Cache generated HTML for 24 hours
- Use database indexes on date fields
- Implement query result caching
- Monitor memory usage during batch processing

## Security Considerations
- Validate all teacher notes for XSS
- Ensure email templates are properly escaped
- Use environment variables for API keys
- Implement rate limiting on manual sends
- Audit log all report generation

## Quality Checklist
- [x] All necessary context included
- [x] Database schema updates defined
- [x] Service layer implementation detailed
- [x] UI components specified
- [x] API endpoints documented
- [x] Validation gates are executable
- [x] Error handling documented
- [x] Performance optimizations included
- [x] Security considerations addressed

## Confidence Score: 9/10
This PRP provides comprehensive context for implementing automated daily activity reports. The implementation follows existing TotHub patterns and integrates seamlessly with current features. The only minor uncertainty is around specific SendGrid template formatting, but the core implementation path is clear.