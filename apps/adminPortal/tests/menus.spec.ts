import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Menus Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/menus');
  });

  test('lists menus', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    // Check for default menus from seed
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('IM Operations')).toBeVisible();
  });

  test('creates, edits, adds child and deletes a menu', async ({ page }) => {
    const timestamp = Date.now();
    const menuName = `Test Menu ${timestamp}`;
    const childName = `Child Menu ${timestamp}`;
    const updatedName = `Updated Menu ${timestamp}`;

    // Create
    await page.getByRole('button', { name: 'Create Menu' }).click();
    await page.getByLabel('Name', { exact: true }).fill(menuName);
    await page.getByLabel('Path').fill(`/test-${timestamp}`);
    await page.getByLabel('Icon').fill('star');
    await page.getByLabel('Sort Order').fill('100');
    await page.getByLabel('Permission Code').fill('test:view');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Menu saved successfully')).toBeVisible();
    await expect(page.getByText(menuName)).toBeVisible();

    // Add child
    const row = page.locator('tr').filter({ hasText: menuName });
    await row.getByRole('button', { name: 'Add Sub-menu' }).click();
    await page.getByLabel('Name', { exact: true }).fill(childName);
    await page.getByLabel('Path').fill(`/test-${timestamp}/child`);
    await page.getByLabel('Icon').fill('circle');
    await page.getByLabel('Sort Order').fill('1');
    await page.getByLabel('Permission Code').fill('test:child:view');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Menu saved successfully')).toBeVisible();
    await expect(page.getByText(childName)).toBeVisible();

    // Edit
    await row.getByRole('button', { name: 'Edit Menu' }).click();
    await page.getByLabel('Name', { exact: true }).fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Menu saved successfully')).toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();

    // Delete (should delete children too)
    const updatedRow = page.locator('tr').filter({ hasText: updatedName });
    await updatedRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(/Are you sure you want to delete this menu/)).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Menu deleted successfully')).toBeVisible();
    await expect(page.getByText(updatedName)).not.toBeVisible();
    await expect(page.getByText(childName)).not.toBeVisible();
  });
});
