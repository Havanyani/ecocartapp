import { expect, Page, test } from '@playwright/test';

interface TestUser {
  email: string;
  password: string;
}

const testUser: TestUser = {
  email: 'test@example.com',
  password: 'Test123!'
};

test.describe('EcoCart E2E Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display welcome message', async ({ page }: { page: Page }) => {
    const welcomeMessage = await page.getByText('Welcome to EcoCart');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should navigate to login screen', async ({ page }: { page: Page }) => {
    const loginButton = await page.getByRole('button', { name: 'Login' });
    await loginButton.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle login with valid credentials', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    
    const submitButton = await page.getByRole('button', { name: 'Login' });
    await submitButton.click();
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display error message with invalid credentials', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    const submitButton = await page.getByRole('button', { name: 'Login' });
    await submitButton.click();
    
    const errorMessage = await page.getByText('Invalid email or password');
    await expect(errorMessage).toBeVisible();
  });

  test('should navigate to registration screen', async ({ page }: { page: Page }) => {
    const registerButton = await page.getByRole('button', { name: 'Register' });
    await registerButton.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should handle successful registration', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:3000/register');
    
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('NewUser123!');
    await page.getByLabel('Confirm Password').fill('NewUser123!');
    
    const submitButton = await page.getByRole('button', { name: 'Register' });
    await submitButton.click();
    
    await expect(page).toHaveURL(/.*dashboard/);
  });
}); 