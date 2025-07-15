import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SupportIQ/);
});

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toBeVisible();
}); 