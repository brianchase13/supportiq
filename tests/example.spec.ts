import { test, expect } from '@playwright/test';
import { 
  waitForPageLoad, 
  expectElementVisible, 
  expectTitleContains,
  checkForErrors 
} from './helpers/test-utils';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await waitForPageLoad(page);
  await expectTitleContains(page, 'SupportIQ');
});

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await waitForPageLoad(page);
  
  // Check for main content
  await expectElementVisible(page, 'h1');
  
  // Verify page has loaded
  await expect(page.locator('body')).toBeVisible();
  
  // Check for console errors
  await checkForErrors(page);
});

test('homepage has hero section', async ({ page }) => {
  await page.goto('/');
  await waitForPageLoad(page);
  
  // Check for the main hero headline
  await expectElementVisible(page, 'h1:has-text("Stop Answering the Same")');
  
  // Check for CTA button - use first() to avoid strict mode violation
  await expect(page.locator('button:has-text("Claim $69/mo Founder Deal")').first()).toBeVisible();
});

test('homepage is responsive', async ({ page }) => {
  await page.goto('/');
  await waitForPageLoad(page);
  
  // Test desktop view
  await page.setViewportSize({ width: 1280, height: 720 });
  await expectElementVisible(page, 'h1');
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expectElementVisible(page, 'h1');
});

test('homepage has key sections', async ({ page }) => {
  await page.goto('/');
  await waitForPageLoad(page);
  
  // Check for key sections using more specific selectors
  await expect(page.locator('h2:has-text("Why Founders Love SupportIQ")')).toBeVisible();
  await expect(page.locator('h2:has-text("How It Works")')).toBeVisible();
  await expect(page.locator('h2:has-text("Trusted by Founders Who Ship")')).toBeVisible();
}); 