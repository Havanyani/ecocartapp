import { by, expect as detoxExpect, device, element } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxEnableOnboardingFlow: true } // Custom arg to enable onboarding in test mode
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display welcome screen and navigate to login', async () => {
    // Verify welcome screen shows
    await detoxExpect(element(by.text('Welcome to EcoCart'))).toBeVisible();
    await detoxExpect(element(by.text('Reduce waste, earn rewards'))).toBeVisible();
    
    // Navigate to login
    await element(by.text('Sign In')).tap();
    
    // Verify login screen
    await detoxExpect(element(by.text('Sign in to your account'))).toBeVisible();
    await detoxExpect(element(by.id('email-input'))).toBeVisible();
    await detoxExpect(element(by.id('password-input'))).toBeVisible();
  });

  it('should show validation errors on empty form submit', async () => {
    // Navigate to login screen
    await element(by.text('Sign In')).tap();
    
    // Submit empty form
    await element(by.text('Sign In')).atIndex(1).tap();
    
    // Check for validation errors
    await detoxExpect(element(by.text('Email is required'))).toBeVisible();
    await detoxExpect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    // Navigate to login screen
    await element(by.text('Sign In')).tap();
    
    // Enter invalid credentials
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    
    // Hide keyboard
    await element(by.id('password-input')).tapReturnKey();
    
    // Submit form
    await element(by.text('Sign In')).atIndex(1).tap();
    
    // Check for error message
    await detoxExpect(element(by.text('Invalid email or password'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    // Navigate to login screen
    await element(by.text('Sign In')).tap();
    
    // Enter valid credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test@123');
    
    // Hide keyboard
    await element(by.id('password-input')).tapReturnKey();
    
    // Submit form
    await element(by.text('Sign In')).atIndex(1).tap();
    
    // Verify successful login - dashboard should be visible
    await detoxExpect(element(by.text('Dashboard'))).toBeVisible();
    await detoxExpect(element(by.id('nav-tab-home'))).toBeVisible();
  });

  it('should navigate to signup screen and create account', async () => {
    // Restart app for clean state
    await device.launchApp({ newInstance: true });
    
    // Navigate to welcome screen and then to signup
    await element(by.text('Create Account')).tap();
    
    // Verify signup screen
    await detoxExpect(element(by.text('Create an account'))).toBeVisible();
    
    // Fill signup form
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('NewPass@123');
    await element(by.id('confirm-password-input')).typeText('NewPass@123');
    
    // Hide keyboard
    await element(by.id('confirm-password-input')).tapReturnKey();
    
    // Accept terms
    await element(by.id('terms-checkbox')).tap();
    
    // Submit form
    await element(by.text('Sign Up')).tap();
    
    // Verify successful registration - onboarding or dashboard should be visible
    await detoxExpect(
      element(by.text('Welcome to EcoCart!')).or(by.text('Dashboard'))
    ).toBeVisible();
  });

  it('should log out successfully', async () => {
    // Login first
    await element(by.text('Sign In')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.id('password-input')).tapReturnKey();
    await element(by.text('Sign In')).atIndex(1).tap();
    
    // Wait for dashboard to load
    await detoxExpect(element(by.text('Dashboard'))).toBeVisible();
    
    // Navigate to profile
    await element(by.id('nav-tab-profile')).tap();
    
    // Tap logout button
    await element(by.id('logout-button')).tap();
    
    // Confirm logout
    await element(by.text('Yes, Log Out')).tap();
    
    // Verify we're logged out and back at welcome screen
    await detoxExpect(element(by.text('Welcome to EcoCart'))).toBeVisible();
  });
}); 