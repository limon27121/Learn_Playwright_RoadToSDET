// Import tools from Playwright:
// - test:           creates a test (test('name', async () => {...}))
// - expect:         checks a result; the test fails if the check is false
// - BrowserContext: TYPE for a browser session (like one incognito window with its own cookies)
// - Page:           TYPE for one tab inside that session
import { test, expect, BrowserContext, Page } from '@playwright/test';
import { Suites } from '../Utils/Suites';


// Variables declared OUTSIDE the tests, so ALL tests below can use the same ones.
// They are empty now; beforeAll fills them.
let context: BrowserContext;
let page: Page;

// describe = a group of related tests. The name shows in the test report.
test.describe('Browser Fixture Tests', () => {

// Run the tests in this group one after another, in the order written.
// Needed because they share one page: each test continues where the previous one stopped.
// If one test fails, the rest are skipped (they would fail anyway).
test.describe.configure({ mode: 'serial' });

// beforeAll runs ONCE before all tests in this group.
// { browser } = Playwright gives us the opened browser (Chromium, from playwright.config.ts).
test.beforeAll(async ({ browser }) => {
  // Create a new browser session and load auth.json into it.
  // auth.json holds the saved login cookie ('token'), so the site thinks we are already logged in.
  context = await browser.newContext({ storageState: 'auth.json' });
  // Open one tab in that session. All tests below use this same tab.
  page = await context.newPage();
});

// afterAll runs ONCE after all tests finish.
// We created the context ourselves, so we must close it ourselves (frees memory, closes the browser window).
test.afterAll(async () => {
  await context.close();
});

// Test 1: prove the login from auth.json works.
// No { page } in the brackets: we use the SHARED page from beforeAll, not a new empty one.
test('open profile already logged in',{tag:Suites.smoke},async () => {
  // '/dashboard/profile' + baseURL from playwright.config.ts = http://localhost:3000/dashboard/profile
  await page.goto('/dashboard/profile');
  // If we were NOT logged in, the site would show the login page and this check would fail.
  // exact: true = heading must be exactly 'Profile' (not 'Profile Settings' etc.)
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
});


// Test 2: open the practice page. The next tests need this page already open (that's why mode is serial).
test('visit practice site',{tag:Suites.smoke}, async () => {
  await page.goto('/dashboard/practice-components');
});

// Test 3: double click a button that shows a browser alert (popup with an OK button).
test('double-button-click',{tag:Suites.smoke},async () => {
  // Empty box to store the alert text.
  let message = '';
  // Listen for the alert BEFORE clicking: it appears instantly, and if nobody listens,
  // Playwright closes it automatically and we lose the text.
  // once = handle only the next alert, then stop listening.
  page.once('dialog', async (dialog) => {
    message = dialog.message(); // copy the alert text into our box
    await dialog.accept();      // press OK to close the alert
  });

  // Find the button by its role (button) and visible name, then double click it.
  await page.getByRole('button', { name: 'Double Click Me' }).dblclick();
  // Print the text in the terminal so we can see it.
  console.log('Alert message:', message);
  // Check the text is exactly what we expect. No 'await' needed: message is already a plain string.
  expect(message).toBe('double clicked!');
});

// Test 4: click a button that opens a NEW browser window, then check that window.
test('New window handling', async () => {

  // A new window/tab opens inside the context (session), not inside page.
  // Start waiting for it BEFORE clicking, so we don't miss it. No 'await' yet: just start listening.
  const newWindowPromise = context.waitForEvent('page');
  // Click the button that opens the new window.
  await page.getByRole('button', { name: 'Open New Window' }).click();
  // Now wait until the new window really exists, and keep it in newWindow.
  // newWindow works exactly like page (goto, click, expect...).
  const newWindow = await newWindowPromise;

  // Wait until the new window has finished loading its page.
  await newWindow.waitForLoadState();
  // Print its address and title in the terminal.
  console.log('New Window URL:', newWindow.url());
  console.log('New Window title:', await newWindow.title());

  // Check the new window opened the right site.
  // /example\.com/ is a regex: URL must CONTAIN 'example.com' (the \ makes '.' a real dot).
  await expect(newWindow).toHaveURL(/example\.com/);
  await expect(newWindow).toHaveTitle('Example Domain');
  // Close the new window. Our original page is still open.
  await newWindow.close();
  // Check the original page still works: its button is still visible.
  await expect(page.getByRole('button', { name: 'Open New Window' })).toBeVisible();

});

test('open modal button',{tag:Suites.smoke}, async ({ page }) => {
 await page.goto('/dashboard/practice-components');
 //using css locator to click on the button that opens the modal
 await page.locator('#openModalBtn').click();
 const modal = page.getByRole('dialog');
 await expect(modal).toBeVisible();
 await expect(modal).toContainText('Practice Modal');
 await page.getByText('Close', { exact: true }).click();
 await expect(modal).not.toBeVisible();
 await expect(page.getByText('Modal Closed!')).toBeVisible();
});

//Date and Time Picker
test('date and time picker', async ({ page }) => {
  await page.goto('/dashboard/practice-components');
  const dateTime = page.locator('input[type="datetime-local"]');
  await dateTime.fill('2026-12-25T10:30');
  await expect(dateTime).toHaveValue('2026-12-25T10:30');
});

})
