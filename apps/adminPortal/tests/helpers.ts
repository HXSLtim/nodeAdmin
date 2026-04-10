import { expect, Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');

  // Wait for tenant selector to be ready (API call must complete)
  await page.waitForLoadState('domcontentloaded');
  const tenantLocator = page.getByLabel('Tenant ID');
  await expect(tenantLocator).toBeVisible({ timeout: 10_000 });

  await page.getByLabel('Email').fill('admin@nodeadmin.dev');
  await page.getByLabel('Password').fill('Admin123456');

  const tagName = await tenantLocator.evaluate((el) => el.tagName.toLowerCase());
  if (tagName === 'select') {
    await tenantLocator.selectOption('default');
  } else {
    await tenantLocator.fill('default');
  }

  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL(/\/overview/, { timeout: 15_000 });

  // Wait for the main layout to be fully rendered (sidebar, header, content)
  // This prevents race conditions when tests navigate immediately after login
  await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
}

/**
 * Navigate to a page after login, waiting for the main content area to be
 * ready. Use this instead of `page.goto()` after `login()` to avoid races.
 */
export async function navigateAfterLogin(page: Page, path: string) {
  await page.goto(path);
  // Wait for the route's main content to render ( SPA navigation)
  await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
}
