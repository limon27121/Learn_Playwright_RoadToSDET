import { Page, Locator } from '@playwright/test';

export class LoginPage {
readonly page: Page;
readonly emailInput: Locator;
readonly passwordInput: Locator;
readonly loginButton: Locator;
readonly profileHeading: Locator;

constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'you@example.com' });
    this.passwordInput = page.getByRole('textbox', { name: 'Enter password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    // After login the app opens the Profile page
    this.profileHeading = page.getByRole('heading', { name: 'Profile', exact: true });
}

async goto() {
    await this.page.goto('/');
}

async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
}

// Save cookies + localStorage (login token) so other tests can skip login
async saveLoginState(path: string = 'auth.json') {
    await this.page.context().storageState({ path });
}

}
