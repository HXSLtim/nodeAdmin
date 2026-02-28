import { expect, test } from '@playwright/test';

test('overview route renders heading', async ({ page }) => {
  await page.goto('/overview');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Node Admin Console');
  await expect(page.getByText('Platform Overview')).toBeVisible();
});
