import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('Backlog Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/backlog');
  });

  test('switches tabs between Tasks and Sprints', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible();

    // Sprints tab
    await page.getByRole('button', { name: 'Sprints' }).click();
    await expect(page.getByRole('button', { name: 'New Sprint' })).toBeVisible();

    // Tasks tab
    await page.getByRole('button', { name: 'Tasks' }).click();
    await expect(page.getByRole('button', { name: 'New Task' })).toBeVisible();
  });

  test('creates, edits and deletes a task', async ({ page }) => {
    const timestamp = Date.now();
    const taskTitle = `Test Task ${timestamp}`;
    const updatedTitle = `Updated Task ${timestamp}`;

    // Create
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByLabel('Title').fill(taskTitle);
    await page.locator('#task-desc').fill('This is a test task');
    await page.getByLabel('Priority').selectOption('high');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(taskTitle)).toBeVisible();

    // Edit
    const row = page.locator('tr').filter({ hasText: taskTitle });
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Title').fill(updatedTitle);
    await page.getByLabel('Status').selectOption('in_progress');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Delete
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Are you sure you want to delete this task?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test('creates a sprint', async ({ page }) => {
    const timestamp = Date.now();
    const sprintName = `Sprint ${timestamp}`;

    await page.getByRole('button', { name: 'Sprints' }).click();
    await page.getByRole('button', { name: 'New Sprint' }).click();

    await page.getByLabel('Sprint Name').fill(sprintName);
    await page.locator('#sprint-goal').fill('Testing sprint creation');
    await page.getByLabel('Start Date').fill('2026-04-01');
    await page.getByLabel('End Date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(sprintName)).toBeVisible();
  });
});
