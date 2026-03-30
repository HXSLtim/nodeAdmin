import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/users');
  });

  test('lists users and can search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    // Check if the default admin is in the list
    await expect(page.getByText('admin@nodeadmin.dev')).toBeVisible();

    // Search
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('admin@nodeadmin.dev');
    await expect(page.getByRole('cell', { name: 'admin@nodeadmin.dev' })).toBeVisible();

    await searchInput.fill('nonexistent-user-xyz');
    await expect(page.getByText('No users found')).toBeVisible();
  });

  test('creates, edits and deletes a user', async ({ page }) => {
    const timestamp = Date.now();
    const email = `user-${timestamp}@example.com`;
    const name = `Test User ${timestamp}`;
    const newName = `Updated User ${timestamp}`;

    // Create
    await page.getByRole('button', { name: 'Create User' }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Name').fill(name);
    // Select a role if any exist
    const roleCheckbox = page.getByLabel('viewer');
    if (await roleCheckbox.isVisible()) {
        await roleCheckbox.check();
    }
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('User saved successfully')).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // Edit
    // Find the row for the user and click edit
    const row = page.locator('tr').filter({ hasText: email });
    await row.getByRole('button', { name: 'Edit User' }).click();
    await page.getByLabel('Name').fill(newName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('User saved successfully')).toBeVisible();
    await expect(page.getByText(newName)).toBeVisible();

    // Delete
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Are you sure you want to delete this user?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('User deleted successfully')).toBeVisible();
    await expect(page.getByText(email)).not.toBeVisible();
  });
});
