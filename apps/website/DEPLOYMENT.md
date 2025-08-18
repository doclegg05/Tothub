# TotHub Website Deployment Guide

## Overview
This document provides deployment instructions for the TotHub website Next.js application.

## Prerequisites
- Node.js 18+ 
- pnpm package manager
- Access to deployment platform (Vercel, Netlify, etc.)

## Local Development

### Installation
```bash
cd apps/website
pnpm install
```

### Development Server
```bash
pnpm dev
```
The application will be available at `http://localhost:3000`

### Building for Production
```bash
pnpm build
```

### Testing
```bash
# Run Playwright tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests in headed mode
pnpm test:headed
```

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `apps/website`
3. Configure build settings:
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build Command: `cd apps/website && pnpm build`
   - Publish Directory: `apps/website/.next`
3. Set environment variables if needed

### Docker Deployment
```dockerfile
# Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/website/.next ./.next
COPY --from=builder /app/apps/website/public ./public
COPY --from=builder /app/apps/website/package.json ./package.json
RUN npm install -g pnpm
RUN pnpm install --prod
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SITE_URL`: Your website URL (e.g., https://tothub.com)

### Optional
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: Google Analytics tracking ID
- `NEXT_PUBLIC_GOOGLE_VERIFICATION`: Google Search Console verification code

## SEO Configuration

### Meta Tags
- All pages include proper Open Graph tags
- Twitter Card support
- Proper meta descriptions and titles
- Robots meta tags for search engines

### Sitemap
- Automatically generated sitemap.xml
- Includes all main pages with proper priorities
- Located at `/sitemap.xml`

### Robots.txt
- Configured for search engine crawling
- Points to sitemap location
- Disallows admin and API routes

## Performance Optimization

### Built-in Features
- Next.js 14 with App Router
- Automatic code splitting
- Image optimization
- Font optimization with Google Fonts
- Tailwind CSS for minimal CSS bundle

### Additional Optimizations
- Enable compression middleware
- Configure CDN for static assets
- Implement caching strategies
- Monitor Core Web Vitals

## Security Considerations

### Headers
- Implement security headers (HSTS, CSP, etc.)
- Configure CORS policies
- Enable HTTPS redirects

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Monitoring and Analytics

### Performance Monitoring
- Vercel Analytics (if using Vercel)
- Google PageSpeed Insights
- Web Vitals monitoring

### Error Tracking
- Sentry integration
- Error boundary implementation
- Logging and monitoring

## Maintenance

### Regular Updates
- Keep Next.js and dependencies updated
- Monitor security advisories
- Update content and meta information
- Review and update sitemap

### Backup Strategy
- Version control for all code changes
- Database backups (if applicable)
- Content backup strategy

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and pnpm installation
2. **Image Loading**: Verify public directory structure
3. **Routing Issues**: Check Next.js App Router configuration
4. **Styling Problems**: Verify Tailwind CSS configuration

### Support
- Check Next.js documentation
- Review deployment platform logs
- Consult team for complex issues

## Future Enhancements
- Implement ISR (Incremental Static Regeneration)
- Add PWA capabilities
- Implement advanced caching strategies
- Add A/B testing capabilities
- Implement analytics dashboard