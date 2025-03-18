import { by, device, element } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display welcome screen on first launch', async () => {
    await expect(element(by.text('Welcome to EcoCart'))).toBeVisible();
  });

  it('should navigate to login screen', async () => {
    await element(by.text('Login')).tap();
    await expect(element(by.text('Sign In'))).toBeVisible();
  });

  it('should show validation errors on empty form submit', async () => {
    await element(by.text('Login')).tap();
    await element(by.text('Sign In')).tap();
    
    await expect(element(by.text('Email is required'))).toBeVisible();
    await expect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    await element(by.text('Login')).tap();
    
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.text('Sign In')).tap();
    
    await expect(element(by.text('Invalid email or password'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.text('Login')).tap();
    
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.text('Sign In')).tap();
    
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // First login
    await element(by.text('Login')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.text('Sign In')).tap();
    
    // Navigate to profile
    await element(by.text('Profile')).tap();
    
    // Logout
    await element(by.text('Logout')).tap();
    await element(by.text('Confirm')).tap();
    
    // Verify logged out
    await expect(element(by.text('Welcome to EcoCart'))).toBeVisible();
  });

  it('should allow user registration', async () => {
    // Navigate to registration
    await element(by.text('Register')).tap();
    
    // Fill registration form
    await element(by.id('name-input')).typeText('New User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('NewPass@123');
    await element(by.id('confirm-password-input')).typeText('NewPass@123');
    
    // Submit form
    await element(by.text('Create Account')).tap();
    
    // Verify registration success
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should enforce password requirements', async () => {
    // Navigate to registration
    await element(by.text('Register')).tap();
    
    // Fill form with weak password
    await element(by.id('name-input')).typeText('New User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('weak');
    await element(by.id('confirm-password-input')).typeText('weak');
    
    // Submit form
    await element(by.text('Create Account')).tap();
    
    // Verify password error message
    await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
  });
}); 