# TotHub Website

A modern, responsive website for TotHub daycare management platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **SEO Optimized**: Open Graph tags, meta descriptions, sitemap, and robots.txt
- **Performance**: Optimized for Core Web Vitals and fast loading
- **Accessibility**: Built with accessibility best practices
- **Testing**: Comprehensive Playwright test suite for navigation and functionality

## Pages

- **Homepage** (`/`): Landing page with hero section and feature highlights
- **Features** (`/features`): Detailed feature overview with visual elements
- **Pricing** (`/pricing`): Pricing plans and comparison
- **Security** (`/security`): Security features and compliance information
- **Resources** (`/resources`): Helpful resources, guides, and documentation
- **Demo** (`/demo`): Interactive demo and trial signup

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager

### Installation

```bash
cd apps/website
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Building

```bash
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests in headed mode
pnpm test:headed
```

## Project Structure

```
apps/website/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Homepage
│   ├── features/          # Features page
│   ├── pricing/           # Pricing page
│   ├── security/          # Security page
│   ├── resources/         # Resources page
│   └── demo/              # Demo page
├── public/                 # Static assets
│   ├── sitemap.xml        # SEO sitemap
│   └── robots.txt         # Search engine directives
├── tests/                  # Playwright test suite
│   └── navigation.spec.ts # Navigation tests
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── playwright.config.ts    # Playwright configuration
├── DEPLOYMENT.md           # Deployment instructions
└── README.md               # This file
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Playwright
- **Package Manager**: pnpm
- **Deployment**: Vercel-ready (or other platforms)

## SEO Features

- **Meta Tags**: Comprehensive Open Graph and Twitter Card support
- **Sitemap**: Automatically generated XML sitemap
- **Robots.txt**: Search engine crawling directives
- **Structured Data**: Ready for schema markup implementation
- **Performance**: Optimized for Core Web Vitals

## Customization

### Colors and Branding

Update the primary color scheme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
    },
  },
}
```

### Content

- Update page content in respective `page.tsx` files
- Modify metadata in `layout.tsx` and individual pages
- Update sitemap.xml with new URLs
- Customize robots.txt as needed

### Styling

- Modify `globals.css` for global styles
- Use Tailwind utility classes for component styling
- Create custom components in the `components/` directory

## Testing Strategy

The project includes comprehensive Playwright tests covering:

- **Navigation**: All page routes and navigation elements
- **Content**: Page titles, headings, and key content
- **Responsiveness**: Mobile and desktop viewport testing
- **Functionality**: CTA buttons and interactive elements
- **SEO**: Meta tags and page structure validation

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set root directory to `apps/website`
4. Deploy automatically

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run the test suite
5. Submit a pull request

## Support

For questions or issues:

- Check the [deployment guide](./DEPLOYMENT.md)
- Review Next.js documentation
- Consult the team for complex issues

## License

This project is part of the TotHub platform and follows the same licensing terms.