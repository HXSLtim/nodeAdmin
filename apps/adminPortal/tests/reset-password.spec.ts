import { expect, test } from '@playwright/test';

test.describe('Password Reset Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password');
  });

  test('shows reset password form', async ({ page }) => {
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/New Password|Password/i).first()).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
  });

  test('has link back to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('has tenant selector', async ({ page }) => {
    const tenantLocator = page.getByLabel(/Tenant/i);
    await expect(tenantLocator).toBeVisible();
  });

  test('submit button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Reset Password/i })).toBeVisible();
  });

  test('login page has forgot password link', async ({ page }) => {
    await page.goto('/login');
    const forgotLink = page.getByRole('link', { name: /forgot/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/reset-password/);
  });
});
