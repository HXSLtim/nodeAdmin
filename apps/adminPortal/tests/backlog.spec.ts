import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Backlog Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/backlog');
    await page.waitForTimeout(1000);
  });

  test('switches tabs between Tasks and Sprints', async ({ page }) => {
    await expect(page.getByRole('main').getByRole('heading', { name: /Backlog/i })).toBeVisible();

    // Sprints tab
    await page.getByRole('button', { name: /Sprints/i }).click();
    await expect(page.getByRole('button', { name: /Create|New/i })).toBeVisible();

    // Tasks tab
    await page.getByRole('button', { name: /Tasks/i }).click();
    await expect(page.getByRole('button', { name: /Create|New/i })).toBeVisible();
  });

  test('creates, edits and deletes a task', async ({ page }) => {
    const timestamp = Date.now();
    const taskTitle = `Test Task ${timestamp}`;
    const updatedTitle = `Updated Task ${timestamp}`;

    // Create
    await page.getByRole('button', { name: /New Task/i }).click();
    await page.getByLabel(/Title/i).fill(taskTitle);
    await page.locator('#task-desc').fill('This is a test task');
    await page.getByLabel(/Priority/i).selectOption('high');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText(/saved|successfully/i)).toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Edit
    const row = page.locator('tr').filter({ hasText: taskTitle });
    await row.getByRole('button', { name: /Edit/i }).click();
    await page.getByLabel(/Title/i).fill(updatedTitle);
    await page.getByLabel(/Status/i).selectOption('in_progress');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText(/saved|successfully/i)).toBeVisible();
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Delete
    await row.getByRole('button', { name: /Delete/i }).click();
    await expect(page.getByText(/Are you sure you want to delete this task/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirm/i }).click();

    await expect(page.getByText(/deleted|successfully/i)).toBeVisible();
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test('creates a sprint', async ({ page }) => {
    const timestamp = Date.now();
    const sprintName = `Sprint ${timestamp}`;

    await page.getByRole('button', { name: /Sprints/i }).click();
    await page.getByRole('button', { name: /New Sprint/i }).click();

    await page.getByLabel(/Sprint Name/i).fill(sprintName);
    await page.locator('#sprint-goal').fill('Testing sprint creation');
    await page.getByLabel(/Start Date/i).fill('2026-04-01');
    await page.getByLabel(/End Date/i).fill('2026-04-14');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText(/saved|successfully/i)).toBeVisible();
    await expect(page.getByText(sprintName)).toBeVisible();
  });
});
