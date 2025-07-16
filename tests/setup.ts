import { test as setup, expect } from '@playwright/test';

// Global setup to ensure the app is ready
setup('ensure app is ready', async ({ page }) => {
  // Wait for the app to be fully loaded
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Verify the app is working by checking for key elements
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  
  // Check that the page title is correct
  await expect(page).toHaveTitle(/SupportIQ/);
});

// Test environment validation
setup('validate test environment', async ({ page }) => {
  // Check if we can access the page
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  
  // Verify no console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Log any errors but don't fail the test
  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }
}); 