import { by, device, element } from 'detox';

describe('Material Collection Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login
    await element(by.text('Login')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.text('Sign In')).tap();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to materials screen', async () => {
    await element(by.text('Materials')).tap();
    await expect(element(by.text('Available Materials'))).toBeVisible();
  });

  it('should display material categories', async () => {
    await element(by.text('Materials')).tap();
    
    // Check if categories are visible
    await expect(element(by.text('Plastic'))).toBeVisible();
    await expect(element(by.text('Paper'))).toBeVisible();
    await expect(element(by.text('Glass'))).toBeVisible();
  });

  it('should filter materials by category', async () => {
    await element(by.text('Materials')).tap();
    
    // Select Plastic category
    await element(by.text('Plastic')).tap();
    
    // Verify only plastic materials are shown
    await expect(element(by.text('PET Bottles'))).toBeVisible();
    await expect(element(by.text('HDPE Containers'))).toBeVisible();
    
    // Change category to Paper
    await element(by.text('Paper')).tap();
    
    // Verify paper materials are shown
    await expect(element(by.text('Cardboard'))).toBeVisible();
    await expect(element(by.text('Newspapers'))).toBeVisible();
  });

  it('should select a material and proceed', async () => {
    await element(by.text('Materials')).tap();
    await element(by.text('Plastic')).tap();
    await element(by.text('PET Bottles')).tap();
    await element(by.text('Next')).tap();
    
    await expect(element(by.text('Schedule Collection'))).toBeVisible();
  });

  it('should complete scheduling process', async () => {
    await element(by.text('Materials')).tap();
    await element(by.text('Plastic')).tap();
    await element(by.text('PET Bottles')).tap();
    await element(by.text('Next')).tap();
    
    // Select date
    await element(by.id('date-picker')).tap();
    await element(by.text('Confirm')).tap();
    
    // Select time
    await element(by.id('time-picker')).tap();
    await element(by.text('Confirm')).tap();
    
    // Provide address
    await element(by.id('address-input')).typeText('123 Test St');
    
    // Add notes
    await element(by.id('notes-input')).typeText('Please collect from front door');
    
    // Confirm scheduling
    await element(by.text('Schedule Collection')).tap();
    
    // Verify success message
    await expect(element(by.text('Collection Scheduled'))).toBeVisible();
  });

  it('should show upcoming collections', async () => {
    await element(by.text('Dashboard')).tap();
    
    // Check if upcoming collection is shown
    await expect(element(by.text('Upcoming Collections'))).toBeVisible();
    await expect(element(by.text('PET Bottles Collection'))).toBeVisible();
    
    // Check collection details
    await element(by.text('PET Bottles Collection')).tap();
    await expect(element(by.text('123 Test St'))).toBeVisible();
    await expect(element(by.text('Please collect from front door'))).toBeVisible();
  });

  it('should allow cancellation of scheduled collection', async () => {
    await element(by.text('Dashboard')).tap();
    await element(by.text('PET Bottles Collection')).tap();
    
    // Cancel collection
    await element(by.text('Cancel Collection')).tap();
    await element(by.text('Confirm')).tap();
    
    // Verify cancellation
    await expect(element(by.text('Collection Cancelled'))).toBeVisible();
    
    // Return to dashboard and verify collection is removed
    await element(by.text('Back to Dashboard')).tap();
    await expect(element(by.text('PET Bottles Collection'))).not.toBeVisible();
  });

  it('should show collection history', async () => {
    await element(by.text('History')).tap();
    
    // Check if history is shown
    await expect(element(by.text('Collection History'))).toBeVisible();
    await expect(element(by.text('PET Bottles Collection (Cancelled)'))).toBeVisible();
  });
}); 