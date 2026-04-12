import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Menus Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/menus');
    await expect(page.getByRole('main').getByRole('heading', { name: /Menu Management/i })).toBeVisible();
  });

  test('lists menus with seed data', async ({ page }) => {
    await expect(page.getByRole('main').getByRole('table')).toBeVisible();

    // Seed data uses Chinese names — match either Chinese or English
    const table = page.getByRole('main').getByRole('table');
    // Overview or 概览 or 平台概览
    await expect(table.getByText(/概览|Overview/i)).toBeVisible();
    // IM or 即时通讯
    await expect(table.getByText(/即时通讯|IM/i)).toBeVisible();
  });

  test('creates, edits, adds child and deletes a menu', async ({ page }) => {
    const timestamp = Date.now();
    const menuName = `Test Menu ${timestamp}`;
    const updatedName = `Updated Menu ${timestamp}`;
    const childName = `Child Menu ${timestamp}`;

    // Create
    await page
      .getByRole('main')
      .getByRole('button', { name: /Create/i })
      .click();
    // Form field labels: "Name", "Path", "Icon", "Sort Order" (from i18n menus.fieldName etc.)
    await page.getByLabel('Name').fill(menuName);
    await page.getByLabel('Path').fill(`/test-${timestamp}`);
    await page.getByLabel('Icon').fill('star');
    await page.getByLabel('Sort Order').fill('999');
    await page.getByRole('button', { name: /Save/i }).click();

    // Wait for dialog to close after save
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('main').getByText(menuName)).toBeVisible({ timeout: 10_000 });

    // Add child (button text is "Add Sub-menu" from i18n menus.createChild)
    const row = page.getByRole('main').locator('tr').filter({ hasText: menuName });
    await row.getByText(/Sub-menu|Add/i).click();
    await page.getByLabel('Name').fill(childName);
    await page.getByLabel('Path').fill(`/test-${timestamp}/child`);
    await page.getByLabel('Icon').fill('circle');
    await page.getByLabel('Sort Order').fill('1');
    await page.getByRole('button', { name: /Save/i }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    // Edit
    await row.getByText(/Edit/i).click();
    await page.getByLabel('Name').fill(updatedName);
    await page.getByRole('button', { name: /Save/i }).click();

    // Wait for dialog to close + reload
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('main').getByText(updatedName)).toBeVisible({ timeout: 10_000 });

    // Delete (should delete children too)
    const updatedRow = page.getByRole('main').locator('tr').filter({ hasText: updatedName });
    await updatedRow.getByText(/Delete/i).click();
    await expect(page.getByRole('dialog').locator('p').filter({ hasText: /sure/i })).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Confirm/i })
      .click();

    await expect(page.getByRole('alert').filter({ hasText: /deleted/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('main').getByText(updatedName)).not.toBeVisible({ timeout: 5_000 });
  });
});
