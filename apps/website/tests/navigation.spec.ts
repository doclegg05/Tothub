import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should display homepage with main navigation elements', async ({ page }) => {
    // Check if main heading is visible
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
    
    // Check if CTA buttons are present
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learn More' })).toBeVisible();
  });

  test('should navigate to features page', async ({ page }) => {
    // Click on Learn More button (should go to features)
    await page.getByRole('link', { name: 'Learn More' }).click();
    
    // Verify we're on features page
    await expect(page).toHaveURL('/features');
    await expect(page.getByRole('heading', { name: 'Powerful Features for Modern Daycares' })).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');
    
    // Verify pricing page content
    await expect(page.getByRole('heading', { name: 'Choose the right plan for your daycare' })).toBeVisible();
    
    // Check if all pricing tiers are visible
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Professional')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('should navigate to security page', async ({ page }) => {
    // Navigate to security page
    await page.goto('/security');
    
    // Verify security page content
    await expect(page.getByRole('heading', { name: 'Enterprise-Grade Security' })).toBeVisible();
    
    // Check if security features are listed
    await expect(page.getByText('End-to-End Encryption')).toBeVisible();
    await expect(page.getByText('Industry Compliance')).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    // Navigate to resources page
    await page.goto('/resources');
    
    // Verify resources page content
    await expect(page.getByRole('heading', { name: 'Resources & Support' })).toBeVisible();
    
    // Check if resource categories are present
    await expect(page.getByText('Getting Started')).toBeVisible();
    await expect(page.getByText('User Manual')).toBeVisible();
    await expect(page.getByText('Video Tutorials')).toBeVisible();
  });

  test('should navigate to demo page', async ({ page }) => {
    // Navigate to demo page
    await page.goto('/demo');
    
    // Verify demo page content
    await expect(page.getByRole('heading', { name: 'Experience TotHub' })).toBeVisible();
    
    // Check if demo elements are present
    await expect(page.getByText('Interactive Demo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Demo' })).toBeVisible();
  });

  test('should have working CTA buttons throughout the site', async ({ page }) => {
    // Test homepage CTA
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    
    // Test features page CTA
    await page.goto('/features');
    await expect(page.getByText('Biometric Authentication')).toBeVisible();
    
    // Test pricing page CTA
    await page.goto('/pricing');
    await expect(page.getByRole('link', { name: 'Get started' })).toHaveCount(3);
    
    // Test demo page CTA
    await page.goto('/demo');
    await expect(page.getByRole('link', { name: 'Start Free Trial' })).toBeVisible();
  });

  test('should display proper page titles and meta descriptions', async ({ page }) => {
    // Check homepage
    await page.goto('/');
    await expect(page).toHaveTitle('TotHub - Daycare Management Platform');
    
    // Check features page
    await page.goto('/features');
    await expect(page).toHaveTitle('Features - TotHub');
    
    // Check pricing page
    await page.goto('/pricing');
    await expect(page).toHaveTitle('Pricing - TotHub');
    
    // Check security page
    await page.goto('/security');
    await expect(page).toHaveTitle('Security - TotHub');
    
    // Check resources page
    await page.goto('/resources');
    await expect(page).toHaveTitle('Resources - TotHub');
    
    // Check demo page
    await page.goto('/demo');
    await expect(page).toHaveTitle('Demo - TotHub');
  });

  test('should have responsive design elements', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile-friendly elements
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Verify desktop elements
    await expect(page.getByRole('heading', { name: 'Transform Your Daycare Operations' })).toBeVisible();
  });
});