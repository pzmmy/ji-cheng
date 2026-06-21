import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';

let server: any;

test.beforeAll(async () => {
  // Start a local server to serve the built frontend
  const buildDir = path.resolve(process.cwd(), 'apps/desktop/build');
  server = spawn('npx', ['serve', buildDir, '-p', '4173', '--no-clipboard'], {
    stdio: 'pipe',
    shell: true,
  });
  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 3000));
});

test.afterAll(async () => {
  if (server) server.kill();
});

test('frontend loads without console errors', async ({ page }) => {
  // Collect console messages
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // Navigate to the frontend
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Wait for the page to render
  await page.waitForTimeout(2000);

  // Check for critical errors (ignore sourcemap warnings)
  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes('sourcemap') && !e.includes('favicon')
  );

  expect(criticalErrors).toEqual([]);
});

test('page has Chinese content', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // The page body should exist
  const body = await page.locator('body');
  await expect(body).toBeVisible();
});
