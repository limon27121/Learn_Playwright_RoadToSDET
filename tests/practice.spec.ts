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


test('open new tab', async ({ page, context }) => {
  await page.goto('/dashboard/practice-components');

  // Start waiting for the new tab BEFORE clicking
  const newTabPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Open New Tab' }).click();
  const newTab = await newTabPromise;

  await newTab.waitForLoadState();
  console.log('New tab URL:', newTab.url());
  console.log('New tab title:', await newTab.title());

  await expect(newTab).toHaveURL(/example\.com/);
  await expect(newTab).toHaveTitle('Example Domain');

  // Close new tab, original page still open
  await newTab.close();
  await expect(page.getByRole('button', { name: 'Open New Tab' })).toBeVisible();
});


test('New window handling', async ({ page,context }) => {
   await page.goto('/dashboard/practice-components');

  // Start waiting for the new window BEFORE clicking
  const newWindowPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Open New Window' }).click();
  const newWindow = await newWindowPromise;

  await newWindow.waitForLoadState();
  console.log('New Window URL:', newWindow.url());
  console.log('New Window title:', await newWindow.title());

  await expect(newWindow).toHaveURL(/example\.com/);
  await expect(newWindow).toHaveTitle('Example Domain');

  // Close new window, original page still open
  await newWindow.close();
  await expect(page.getByRole('button', { name: 'Open New Window' })).toBeVisible();

});



test('open modal button', async ({ page }) => {
 await page.goto('/dashboard/practice-components');
 await page.locator('#openModalBtn').click();
 const modal = page.getByRole('dialog');
 await expect(modal).toBeVisible();
 await expect(modal).toContainText('Practice Modal');
 await page.getByText('Close', { exact: true }).click();
 await expect(modal).not.toBeVisible();
 await expect(page.getByText('Modal Closed!')).toBeVisible();
});


test('date and time picker', async ({ page }) => {
  await page.goto('/dashboard/practice-components');
  const dateTime = page.locator('input[type="datetime-local"]');
  await dateTime.fill('2026-12-25T10:30');
  await expect(dateTime).toHaveValue('2026-12-25T10:30');
});


test('readonly date picker', async ({ page }) => {
  await page.goto('/dashboard/practice-components');
  const dateInput = page.locator('input[readonly]');
  // Readonly: can't type, so open the calendar and click a day
  await dateInput.click();
  await page.getByRole('gridcell', { name: 'Choose Tuesday, October 20th, 2026' }).click();
  await expect(dateInput).toHaveValue('10/20/2026');
});


test('editable date picker', async ({ page }) => {
  await page.goto('/dashboard/practice-components');
  const dateInput = page.getByPlaceholder('Select date');

  // Clear old date first
  await dateInput.clear();
  await expect(dateInput).toHaveValue('');

  // Editable: type the date directly (format MM/DD/YYYY)
  await dateInput.fill('12/25/2026');
  await dateInput.press('Enter'); // confirm and close calendar
  await expect(dateInput).toHaveValue('12/25/2026');
});




test('iframe login form', async ({ page }) => {
  await page.goto('/dashboard/practice-components');

  // Step into the iframe (a page inside the page)
  const frame = page.frameLocator('iframe[title="Embedded Example"]');

  // Check iframe shows the login page
  await expect(frame.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  // Fill login form inside the iframe
  await frame.getByRole('textbox', { name: 'you@example.com' }).fill('admin@test.com');
  await frame.getByRole('textbox', { name: 'Enter password' }).fill('1234');
  await frame.getByRole('button', { name: 'Login' }).click();

  // After login, iframe shows the Profile page
  await expect(frame.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await expect(frame.locator('body')).toContainText('admin@test.com');
});
