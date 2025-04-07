import { by, device, element, expect } from 'detox';

describe('User Profile', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true
    });
    
    // Login to the app first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen to load
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Navigate to Profile screen
    await element(by.id('tab-profile')).tap();
  });

  beforeEach(async () => {
    // Reset to Profile main screen before each test
    await device.reloadReactNative();
    await element(by.id('tab-profile')).tap();
  });

  it('should display user profile information', async () => {
    await expect(element(by.id('profile-screen'))).toBeVisible();
    await expect(element(by.id('user-avatar'))).toBeVisible();
    await expect(element(by.id('user-name'))).toBeVisible();
    await expect(element(by.id('user-email'))).toBeVisible();
    await expect(element(by.id('profile-stats'))).toBeVisible();
  });

  it('should navigate to edit profile screen', async () => {
    await element(by.id('edit-profile-button')).tap();
    
    // Verify edit profile screen
    await expect(element(by.id('edit-profile-screen'))).toBeVisible();
    await expect(element(by.id('name-input'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('phone-input'))).toBeVisible();
    
    // Test updating profile name
    await element(by.id('name-input')).clearText();
    await element(by.id('name-input')).typeText('John Updated');
    await element(by.id('save-profile-button')).tap();
    
    // Verify profile updated
    await expect(element(by.id('user-name'))).toHaveText('John Updated');
  });

  it('should navigate to achievements screen', async () => {
    await element(by.id('achievements-button')).tap();
    
    // Verify achievements screen
    await expect(element(by.id('achievements-screen'))).toBeVisible();
    await expect(element(by.id('achievements-list'))).toBeVisible();
    
    // Check a specific achievement
    await expect(element(by.id('achievement-0'))).toBeVisible();
    
    // Go back to profile
    await element(by.id('back-button')).tap();
  });

  it('should navigate to settings screen', async () => {
    await element(by.id('settings-button')).tap();
    
    // Verify settings screen
    await expect(element(by.id('settings-screen'))).toBeVisible();
    
    // Toggle dark mode
    await element(by.id('dark-mode-toggle')).tap();
    
    // Toggle notifications
    await element(by.id('notifications-toggle')).tap();
    
    // Go back to profile
    await element(by.id('back-button')).tap();
  });

  it('should show recycling history', async () => {
    await element(by.id('history-button')).tap();
    
    // Verify history screen
    await expect(element(by.id('history-screen'))).toBeVisible();
    await expect(element(by.id('history-list'))).toBeVisible();
    
    // Apply date filter
    await element(by.id('filter-button')).tap();
    await element(by.id('date-filter-last-month')).tap();
    
    // Verify filtered results
    await expect(element(by.id('filtered-results-label'))).toBeVisible();
    
    // Go back to profile
    await element(by.id('back-button')).tap();
  });

  it('should show rewards and points balance', async () => {
    await element(by.id('rewards-button')).tap();
    
    // Verify rewards screen
    await expect(element(by.id('rewards-screen'))).toBeVisible();
    await expect(element(by.id('points-balance'))).toBeVisible();
    await expect(element(by.id('available-rewards-list'))).toBeVisible();
    
    // Claim a reward
    await element(by.id('reward-0')).tap();
    await element(by.id('claim-reward-button')).tap();
    
    // Verify claim confirmation
    await expect(element(by.text('Reward Claimed!'))).toBeVisible();
    
    // Go back to profile
    await element(by.id('back-button')).tap();
  });

  it('should allow changing the password', async () => {
    await element(by.id('security-button')).tap();
    
    // Verify security screen
    await expect(element(by.id('security-screen'))).toBeVisible();
    
    // Change password
    await element(by.id('change-password-button')).tap();
    await element(by.id('current-password-input')).typeText('Password123!');
    await element(by.id('new-password-input')).typeText('NewPassword456!');
    await element(by.id('confirm-password-input')).typeText('NewPassword456!');
    await element(by.id('submit-password-button')).tap();
    
    // Verify password changed confirmation
    await expect(element(by.text('Password Changed'))).toBeVisible();
  });

  it('should support logging out', async () => {
    await element(by.id('logout-button')).tap();
    
    // Verify logout confirmation dialog
    await expect(element(by.id('logout-confirmation'))).toBeVisible();
    
    // Confirm logout
    await element(by.id('confirm-logout-button')).tap();
    
    // Verify we're back to login screen
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
}); 