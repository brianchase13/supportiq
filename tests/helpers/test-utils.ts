import { Page, expect } from '@playwright/test';

/**
 * Test utilities for faster, more reliable test execution
 */

export async function waitForPageLoad(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
}

export async function expectElementVisible(page: Page, selector: string, timeout = 10000) {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

export async function expectElementNotVisible(page: Page, selector: string, timeout = 10000) {
  await expect(page.locator(selector)).not.toBeVisible({ timeout });
}

export async function expectTextVisible(page: Page, text: string, timeout = 10000) {
  await expect(page.locator(`text=${text}`)).toBeVisible({ timeout });
}

export async function expectTitleContains(page: Page, text: string) {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
}

export async function clickAndWait(page: Page, selector: string) {
  await page.click(selector);
  await page.waitForLoadState('networkidle');
}

export async function fillAndWait(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
  await page.waitForTimeout(100); // Small delay for validation
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

export async function logConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

export async function checkForErrors(page: Page) {
  const errors = await logConsoleErrors(page);
  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }
  return errors;
}

export async function waitForResponse(page: Page, urlPattern: string) {
  return page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200
  );
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
} 