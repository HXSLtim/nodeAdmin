import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Tenants Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/tenants');
  });

  test('lists tenants', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tenant Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    // Check for default tenant
    await expect(page.getByText('Default Tenant')).toBeVisible();
  });

  test('creates, edits and deletes a tenant', async ({ page }) => {
    const timestamp = Date.now();
    const tenantName = `Test Tenant ${timestamp}`;
    const updatedName = `Updated Tenant ${timestamp}`;

    // Create
    await page.getByRole('button', { name: 'Create Tenant' }).click();
    await page.getByLabel('Name').fill(tenantName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Tenant saved successfully')).toBeVisible();
    await expect(page.getByText(tenantName)).toBeVisible();

    // Edit
    const row = page.locator('tr').filter({ hasText: tenantName });
    await row.getByRole('button', { name: 'Edit Tenant' }).click();
    await page.getByLabel('Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Tenant saved successfully')).toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();

    // Delete
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/Are you sure you want to delete this tenant/)).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Tenant deleted successfully')).toBeVisible();
    await expect(page.getByText(tenantName)).not.toBeVisible();
  });
});
