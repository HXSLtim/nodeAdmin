import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Roles Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/roles');
  });

  test('lists roles and identifies system roles', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    // Check for super-admin (system role)
    const superAdminRow = page.locator('tr').filter({ hasText: 'super-admin' });
    await expect(superAdminRow.getByText('Yes')).toBeVisible();

    // Edit button should be disabled for system roles
    await expect(superAdminRow.getByRole('button', { name: 'Edit Role' })).toBeDisabled();
    // Delete button should be disabled for system roles
    await expect(superAdminRow.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  test('creates, edits and deletes a custom role', async ({ page }) => {
    const timestamp = Date.now();
    const roleName = `Custom Role ${timestamp}`;
    const newDescription = `Updated description ${timestamp}`;

    // Create
    await page.getByRole('button', { name: 'Create Role' }).click();
    await page.getByLabel('Role Name').fill(roleName);
    await page.getByLabel('Description').fill('Test description');

    // Select some permissions
    const permissionCheckbox = page.getByRole('checkbox').first();
    if (await permissionCheckbox.isVisible()) {
        await permissionCheckbox.check();
    }
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Role saved successfully')).toBeVisible();
    await expect(page.getByText(roleName)).toBeVisible();

    // Edit
    const row = page.locator('tr').filter({ hasText: roleName });
    await row.getByRole('button', { name: 'Edit Role' }).click();
    await page.getByLabel('Description').fill(newDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Role saved successfully')).toBeVisible();
    await expect(page.getByText(newDescription)).toBeVisible();

    // Delete
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/Are you sure you want to delete this role/)).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Role deleted successfully')).toBeVisible();
    await expect(page.getByText(roleName)).not.toBeVisible();
  });
});
