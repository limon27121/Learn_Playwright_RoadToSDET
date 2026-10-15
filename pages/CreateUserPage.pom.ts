import { Page, Locator } from '@playwright/test';
export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    birthDate: string; // MM/dd/yyyy, e.g. '11/22/1998'
    gender: 'Male' | 'Female';
    photoPath: string;
    bloodGroup: string;
    district: string;
}


export class CreateUserPage {
readonly page:Page;
readonly firstNameInput: Locator;
readonly lastNameInput: Locator;
readonly emailInput: Locator;
readonly phoneNumberInput: Locator;
readonly passwordInput: Locator;
readonly birthDateInput: Locator;
readonly genderMaleRadio: Locator;
readonly genderFemaleRadio: Locator;
readonly agreementCheckbox: Locator;
readonly photoInput: Locator;
readonly bloodGroupSelect: Locator;
readonly districtSelect: Locator;

constructor(page: Page) {
    this.page = page;
    // Inputs have no id/name, so locate them by placeholder text
    this.firstNameInput = page.getByPlaceholder('John', { exact: true });
    this.lastNameInput = page.getByPlaceholder('Doe', { exact: true });
    this.emailInput = page.getByPlaceholder('john@example.com', { exact: true });
    this.phoneNumberInput = page.getByPlaceholder('01500000000', { exact: true });
    this.passwordInput = page.getByPlaceholder('Create a password', { exact: true });
    this.birthDateInput = page.getByPlaceholder('MM/dd/yyyy', { exact: true });
    this.genderMaleRadio = page.locator('#genderMale');
    this.genderFemaleRadio = page.locator('#genderFemale');
    this.agreementCheckbox = page.locator('#agreement');
    this.photoInput = page.locator('#photoInput');
    // Two <select>s with no id: Blood Group is first, District is last
    this.bloodGroupSelect = page.getByRole('combobox').first();
    this.districtSelect = page.getByRole('combobox').last();
}

async fillForm(userData: UserData) {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.phoneNumberInput.fill(userData.phoneNumber);
    // Options load when the select is clicked, so click before selecting
    await this.bloodGroupSelect.click();
    await this.bloodGroupSelect.selectOption(userData.bloodGroup);
    await this.passwordInput.fill(userData.password);
    // Datepicker: type the date, Escape closes the calendar popup
    await this.birthDateInput.fill(userData.birthDate);
    await this.birthDateInput.press('Escape');
    await this.districtSelect.click();
    await this.districtSelect.selectOption(userData.district);
    await this.genderMaleRadio.check();
    await this.agreementCheckbox.check();
    await this.photoInput.setInputFiles(userData.photoPath);
}


}
