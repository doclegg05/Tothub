## FEATURE:
Automated Daily Activity Reports for Parents - Send comprehensive daily reports to parents at 5 PM with their child's activities, meals, naps, mood tracking, photos from the day, and teacher notes. Reports should be beautifully formatted emails with a summary dashboard.

## EXAMPLES:
- /server/services/emailService.ts - Email sending patterns with SendGrid
- /server/routes/parentRoutes.ts - Parent portal API patterns
- /server/services/analyticsService.ts - Data aggregation patterns
- /client/src/components/check-in-modal.tsx - Photo capture and mood tracking
- /shared/schema.ts - Database schema for attendance, activities

## DOCUMENTATION:
- SendGrid email template documentation
- Existing attendance tracking system with mood ratings and photos
- Parent communication preferences in child profiles
- Analytics service for data aggregation
- Cron job patterns for scheduled tasks

## OTHER CONSIDERATIONS:
- Must respect parent communication preferences (some may opt out)
- Should aggregate data from multiple sources (attendance, activities, meals, photos)
- Email should be mobile-responsive and visually appealing
- Include teacher's personalized notes when available
- Consider timezone handling for international families
- Should track email delivery status and allow resending
- Include developmental milestones and learning objectives met
- Allow parents to reply directly to teachers through the email