import { test, expect } from '@playwright/test';
import { CreateUserPage, UserData } from '../pages/CreateUserPage.pom';
import { LoginPage } from '../pages/LoginPage.pom';

test('Login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@test.com', '1234');

  // Logged in: Profile page is shown
  await expect(loginPage.profileHeading).toBeVisible();
  await expect(page.locator('body')).toContainText('First Name');

  await loginPage.saveLoginState();
});

test.skip('add-new-user', async ({ page }) => {
  await page.goto('/dashboard/add-user');

  // Inputs have no id/name, so locate them by their placeholder text.
  // exact: true, otherwise 'John' also matches the email placeholder 'john@example.com'
  const firstName = page.getByPlaceholder('John', { exact: true });
  const lastName = page.getByPlaceholder('Doe', { exact: true });
  const email = page.getByPlaceholder('john@example.com', { exact: true });
  const phoneNumber = page.getByPlaceholder('01500000000', { exact: true });
  const password = page.getByPlaceholder('Create a password', { exact: true });
  const birthDate = page.getByPlaceholder('MM/dd/yyyy', { exact: true });
  // exact: true, otherwise 'Male' also matches 'Female'
  const genderMale = page.locator('#genderMale');
  const agreement = page.locator('#agreement');
  // "Upload Photo" is a <label for="photoInput">; the real file input has id="photoInput"
  const photoInput = page.locator('#photoInput');

  // Native <select> with no id/name; the page also has a District select,
  // so pick the one whose options include 'Select blood group'
//   const bloodGroup = page.getByRole('combobox').filter({ hasText: 'Select blood group' });
 const bloodGroup = page.getByRole('combobox').first(); // selects the first combobox on the page
  // District is the other <select>; pick it by its placeholder option text
//   const district = page.getByRole('combobox').filter({ hasText: 'Select a district' });
  const district = page.getByRole('combobox').last(); // selects the last combobox on the page

  await firstName.fill('Moontaser');
  await lastName.fill('Limon');
  // Date.now() = current time in milliseconds, different on every run → unique email
  const uniqueEmail = `moontaser.limon${Date.now()}@example.com`;
  await email.fill(uniqueEmail);
  await phoneNumber.fill('01712345678');
  // Dynamic dropdown: options are loaded only when the select is focused/clicked
  await bloodGroup.click();
  await bloodGroup.selectOption('AB+'); // selects by option value (or visible text)
  await password.fill('1234');
  // react-datepicker: type in MM/dd/yyyy format (22 Nov 1998), then Escape closes the
  //    calendar popup
  await birthDate.fill('11/22/1998');
  await birthDate.press('Escape');
  // Click first in case options load on focus (like Blood Group), then select by value
  await district.click();
  await district.selectOption('Dhaka');
  await genderMale.check(); // check() works for radio buttons and checkboxes
  await agreement.check();
  // setInputFiles puts the file into the input directly (no OS file dialog); path is relative to the project root
  // Use a photo under 1 MB: the app (Next.js) rejects requests bigger than 1 MB
  await photoInput.setInputFiles('resources/small-photo.png');
  

  // Check values before submitting; the form may reset or navigate after submit
  await expect(firstName).toHaveValue('Moontaser');
  await expect(lastName).toHaveValue('Limon');
  await expect(email).toHaveValue(uniqueEmail);
  await expect(phoneNumber).toHaveValue('01712345678');
  await expect(bloodGroup).toHaveValue('AB+');
  await expect(password).toHaveValue('1234');
  await expect(district).toHaveValue('Dhaka');
  await expect(birthDate).toHaveValue('11/22/1998');
  await expect(genderMale).toBeChecked();
  await expect(agreement).toBeChecked();
  await expect(photoInput).toHaveValue(/small-photo.png/);
  await page.getByRole('button', { name: 'Create User' }).click();

  // After successful registration the app goes to the users list
  await expect(page).toHaveURL(/\/dashboard\/users/);
  // h2 is "Registered Users <count>"; the count changes, so match only the text part
  await expect(page.getByRole('heading', { name: 'Registered Users' })).toBeVisible();
//   await page.pause();
});


test('Create User', async ({ page }) => {
  let createUserPage = new CreateUserPage(page);
  await page.goto('/dashboard/add-user');
  const userData: UserData = {
    firstName: 'Moontaser',
    lastName: 'Limon',
    email: `moontaser.limon${Date.now()}@example.com`,
    phoneNumber: '01712345678',
    password: '1234',
    birthDate: '11/22/1998',
    gender: 'Male',
    photoPath: 'resources/small-photo.png',
    bloodGroup: 'AB+',
    district: 'Dhaka'
  };
  
  await createUserPage.fillForm(userData);
  await page.getByRole('button', { name: 'Create User' }).click();
  await expect(page.getByText('User created successfully!')).toBeVisible();

  // Redirect waits a few seconds, longer than the default 5s, so allow 15s
  await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Registered Users' })).toBeVisible();

});