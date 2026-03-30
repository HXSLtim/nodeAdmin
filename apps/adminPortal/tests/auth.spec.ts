import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects to login when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto('/overview');
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login and logout', async ({ page }) => {
    await page.goto('/login');

    // Use labels from en.json
    await page.getByLabel('Email').fill('admin@nodeadmin.dev');
    await page.getByLabel('Password').fill('Admin123456');
    await page.getByLabel('Tenant ID').fill('default');

    await page.getByRole('button', { name: 'Login' }).click();

    // Should redirect to overview
    await expect(page).toHaveURL(/\/overview/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Overview');

    // Logout
    // Assuming there is a logout button in the layout.
    // Let's check appLayout.tsx or similar to find the logout button.
    const logoutBtn = page.getByRole('button', { name: 'Logout' });
    if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await expect(page).toHaveURL(/\/login/);
    } else {
        // Try finding it in a user menu if it's hidden
        await page.getByRole('button', { name: /admin/i }).click();
        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page).toHaveURL(/\/login/);
    }
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByLabel('Tenant ID').fill('default');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Login failed')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful registration', async ({ page }) => {
    await page.goto('/register');

    const randomEmail = `test-${Date.now()}@example.com`;

    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill(randomEmail);
    await page.getByLabel('Password', { exact: true }).fill('Test123456');
    await page.getByLabel('Confirm Password').fill('Test123456');
    await page.getByLabel('Tenant ID').fill('default');

    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect to overview
    await expect(page).toHaveURL(/\/overview/);
  });
});
