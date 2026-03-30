import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/profile');
  });

  test('displays user profile information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
    await expect(page.getByText('Account Information')).toBeVisible();
    await expect(page.getByText('User Name')).toBeVisible();
    await expect(page.getByText('admin@nodeadmin.dev')).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByPlaceholder('Current Password').fill('Admin123456');
    await page.getByPlaceholder('New Password').fill('NewPassword123!');
    await page.getByPlaceholder('Confirm Password').fill('DifferentPassword123!');

    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('shows error with wrong current password', async ({ page }) => {
    await page.getByPlaceholder('Current Password').fill('WrongPassword123');
    await page.getByPlaceholder('New Password').fill('NewPassword123!');
    await page.getByPlaceholder('Confirm Password').fill('NewPassword123!');

    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByText('Failed to change password.')).toBeVisible();
  });
});
