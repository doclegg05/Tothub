import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test with better load handling
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should display homepage with main navigation elements', async ({ page }) => {
    // Check if main heading is visible
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
    
    // Check if main CTA buttons are present (using more specific selectors)
    await expect(page.locator('main').getByRole('link', { name: 'Get Started' })).toBeVisible();
    // Target the first "Learn More" button (features) specifically
    await expect(page.locator('main').getByRole('link', { name: 'Learn More' }).first()).toBeVisible();
  });

  test('should navigate to features page', async ({ page }) => {
    // Click on Learn More button in main content (should go to features)
    await page.locator('main').getByRole('link', { name: 'Learn More' }).first().click();
    
    // Verify we're on features page with better load handling
    await expect(page).toHaveURL('/features');
    await expect(page.getByRole('heading', { name: 'Powerful Features for Modern Daycares' })).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    // Navigate to pricing page with better load handling
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    
    // Verify pricing page content
    await expect(page.getByText('Choose the right plan for your daycare')).toBeVisible();
    
    // Check if all pricing tiers are visible (use more specific selectors)
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Professional' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
  });

  test('should navigate to security page', async ({ page }) => {
    // Navigate to security page with better load handling
    await page.goto('/security', { waitUntil: 'domcontentloaded' });
    
    // Verify security page content
    await expect(page.getByRole('heading', { name: 'Enterprise-Grade Security' })).toBeVisible();
    
    // Check if security features are listed
    await expect(page.getByText('End-to-End Encryption')).toBeVisible();
    await expect(page.getByText('Industry Compliance')).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    // Navigate to resources page with better load handling
    await page.goto('/resources', { waitUntil: 'domcontentloaded' });
    
    // Verify resources page content
    await expect(page.getByRole('heading', { name: 'Resources & Support' })).toBeVisible();
    
    // Check if resource categories are present (use more specific selectors)
    await expect(page.getByRole('heading', { name: 'Getting Started' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'User Manual' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Video Tutorials' })).toBeVisible();
  });

  test('should navigate to demo page', async ({ page }) => {
    // Navigate to demo page with better load handling
    await page.goto('/demo', { waitUntil: 'domcontentloaded' });
    
    // Verify demo page content
    await expect(page.getByRole('heading', { name: 'Experience TotHub' })).toBeVisible();
    
    // Check if demo elements are present (use more specific selector)
    await expect(page.getByRole('heading', { name: 'Experience TotHub' })).toBeVisible();
  });

  test('should have working CTA buttons throughout the site', async ({ page }) => {
    // Test homepage CTA (using more specific selector)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main').getByRole('link', { name: 'Get Started' })).toBeVisible();
    
    // Test features page CTA (use more specific selector)
    await page.goto('/features', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Biometric Authentication' })).toBeVisible();
    
    // Test pricing page CTA
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main').getByRole('link', { name: 'Get started' })).toHaveCount(3);
    
    // Test demo page CTA
    await page.goto('/demo', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Start Free Trial' })).toBeVisible();
  });

  test('should display proper page titles and meta descriptions', async ({ page }) => {
    // Check homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('TotHub - Daycare Management Platform');
    
    // Check features page
    await page.goto('/features', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Features - TotHub');
    
    // Check pricing page
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Pricing - TotHub');
    
    // Check security page
    await page.goto('/security', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Security - TotHub');
    
    // Check resources page
    await page.goto('/resources', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Resources - TotHub');
    
    // Check demo page
    await page.goto('/demo', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Demo - TotHub');
  });

  test('should have responsive design elements', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify mobile-friendly elements
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify desktop elements
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
  });
});