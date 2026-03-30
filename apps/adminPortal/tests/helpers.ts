import { Page } from '@playwright/test';

export async function login(page: Page) {
  // Capture browser console logs
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));

  // Log all requests to see if they fail
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', async response => {
      console.log('<<', response.status(), response.url());
      if (response.url().includes('/api/v1/auth/login') && response.status() !== 200) {
          try {
              const body = await response.text();
              console.log('Error Body:', body);
          } catch (e) {
              console.log('Could not read error body');
          }
      }
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@nodeadmin.dev');
  await page.getByLabel('Password').fill('Admin123456');
  await page.getByLabel('Tenant ID').fill('default');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/overview/);
}
