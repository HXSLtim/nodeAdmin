import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
  });

  test('toggles theme', async ({ page }) => {
    // Light theme button
    const lightBtn = page.getByRole('button', { name: 'Light' });
    const darkBtn = page.getByRole('button', { name: 'Dark' });

    await darkBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await lightBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('switches language', async ({ page }) => {
    await page.getByRole('button', { name: '中文' }).click();
    // Check for a known Chinese text, e.g. "设置" (Settings)
    await expect(page.getByRole('heading', { name: '系统设置' })).toBeVisible();

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('displays session information', async ({ page }) => {
    await expect(page.getByText('Session Info')).toBeVisible();
    await expect(page.getByText('User ID')).toBeVisible();
    await expect(page.getByText('Tenant ID')).toBeVisible();
    await expect(page.getByText('default')).toBeVisible(); // Default tenant ID
  });
});
