import { test, expect } from '@playwright/test';

test('User logs in successfully', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('admin@test.com');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('1234');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('First Name');
  // Save cookies + localStorage (login token) to auth.json
  await page.context().storageState({ path: 'auth.json' });
//   await page.pause();
});


test('double-button-click', async ({ page }) => {
  await page.goto('/dashboard/practice-components');

  // Double click opens a browser alert. Listen for it BEFORE clicking.
  let message = '';
  page.once('dialog', async (dialog) => {
    message = dialog.message(); // store alert text
    await dialog.accept();      // press OK
  });

  await page.getByRole('button', { name: 'Double Click Me' }).dblclick();
  console.log('Alert message:', message);
  expect(message).toBe('double clicked!');
});


test('right-button-click', async ({ page }) => {
  await page.goto('/dashboard/practice-components');

  // Right click opens a browser alert. Listen for it BEFORE clicking.
  let message = '';
  page.once('dialog', async (dialog) => {
    message = dialog.message(); // store alert text
    await dialog.accept();      // press OK
  });

  await page.getByRole('button', { name: 'Right Click Me' }).click({ button: 'right' });
  console.log('Alert message:', message);
  expect(message).toBe('context clicked!');
});