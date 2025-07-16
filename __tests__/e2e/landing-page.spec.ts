import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main landing page content', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /AI-powered support analytics/i })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /book demo/i })).toBeVisible();
    
    // Check key features
    await expect(page.getByText(/cut ticket costs by 30%/i)).toBeVisible();
    await expect(page.getByText(/AI-powered insights/i)).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.getByRole('link', { name: /pricing/i }).click();
    await expect(page).toHaveURL('/pricing');
  });

  test('should navigate to demo page', async ({ page }) => {
    await page.getByRole('link', { name: /book demo/i }).click();
    await expect(page).toHaveURL('/demo');
  });

  test('should handle email capture form', async ({ page }) => {
    // Fill out email capture form
    await page.getByPlaceholder(/enter your email/i).fill('test@example.com');
    await page.getByRole('button', { name: /get early access/i }).click();
    
    // Should show success message or redirect
    await expect(page.getByText(/thank you/i)).toBeVisible();
  });

  test('should display pricing information', async ({ page }) => {
    // Navigate to pricing
    await page.getByRole('link', { name: /pricing/i }).click();
    
    // Check pricing tiers
    await expect(page.getByText(/starter/i)).toBeVisible();
    await expect(page.getByText(/growth/i)).toBeVisible();
    await expect(page.getByText(/enterprise/i)).toBeVisible();
    
    // Check pricing amounts
    await expect(page.getByText(/\$99/i)).toBeVisible();
    await expect(page.getByText(/\$299/i)).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu button
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Check mobile menu items
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('should handle lead form submission', async ({ page }) => {
    // Navigate to contact/lead form
    await page.getByRole('link', { name: /contact/i }).click();
    
    // Fill out lead form
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/company/i).fill('Tech Corp');
    await page.getByLabel(/role/i).fill('Support Manager');
    await page.getByLabel(/monthly tickets/i).fill('5000');
    await page.getByLabel(/message/i).fill('Interested in AI-powered support');
    
    // Submit form
    await page.getByRole('button', { name: /send message/i }).click();
    
    // Check success message
    await expect(page.getByText(/thank you for your message/i)).toBeVisible();
  });

  test('should handle authentication flow', async ({ page }) => {
    // Click get started
    await page.getByRole('link', { name: /get started/i }).click();
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
    
    // Check auth form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display testimonials', async ({ page }) => {
    // Scroll to testimonials section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check testimonials are visible
    await expect(page.getByText(/testimonial/i)).toBeVisible();
    await expect(page.getByText(/customer/i)).toBeVisible();
  });

  test('should handle footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer links
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /support/i })).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
    
    // Should have link back to home
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow network
    await page.route('**/*', route => {
      route.fulfill({ status: 200, body: 'Delayed response' });
    });
    
    // Click a link that would trigger loading
    await page.getByRole('link', { name: /get started/i }).click();
    
    // Should show loading indicator
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
  });
}); 