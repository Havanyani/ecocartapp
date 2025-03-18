import { by, device, element } from 'detox';

describe('Rewards and Credits Flow', () => {
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

  it('should display credits balance on dashboard', async () => {
    await element(by.text('Dashboard')).tap();
    await expect(element(by.id('credits-balance'))).toBeVisible();
  });

  it('should navigate to rewards screen', async () => {
    await element(by.text('Rewards')).tap();
    await expect(element(by.text('Available Rewards'))).toBeVisible();
  });

  it('should display reward categories', async () => {
    await element(by.text('Rewards')).tap();
    
    // Check if categories are visible
    await expect(element(by.text('Discounts'))).toBeVisible();
    await expect(element(by.text('Gift Cards'))).toBeVisible();
    await expect(element(by.text('Donations'))).toBeVisible();
  });

  it('should filter rewards by category', async () => {
    await element(by.text('Rewards')).tap();
    
    // Select Discounts category
    await element(by.text('Discounts')).tap();
    
    // Verify discount rewards are shown
    await expect(element(by.text('10% Off Grocery Order'))).toBeVisible();
    await expect(element(by.text('Free Delivery'))).toBeVisible();
    
    // Change category to Gift Cards
    await element(by.text('Gift Cards')).tap();
    
    // Verify gift card rewards are shown
    await expect(element(by.text('$10 Amazon Gift Card'))).toBeVisible();
    await expect(element(by.text('$5 Coffee Shop Card'))).toBeVisible();
  });

  it('should show reward details', async () => {
    await element(by.text('Rewards')).tap();
    await element(by.text('Discounts')).tap();
    await element(by.text('10% Off Grocery Order')).tap();
    
    // Verify reward details
    await expect(element(by.text('Reward Details'))).toBeVisible();
    await expect(element(by.text('Credits Required: 50'))).toBeVisible();
    await expect(element(by.text('Valid for 30 days'))).toBeVisible();
  });

  it('should redeem a reward successfully', async () => {
    await element(by.text('Rewards')).tap();
    await element(by.text('Discounts')).tap();
    await element(by.text('10% Off Grocery Order')).tap();
    
    // Redeem reward
    await element(by.text('Redeem Reward')).tap();
    await element(by.text('Confirm')).tap();
    
    // Verify redemption success
    await expect(element(by.text('Reward Redeemed'))).toBeVisible();
    
    // Check that credits were deducted
    await element(by.text('Back to Rewards')).tap();
    await element(by.text('Dashboard')).tap();
    
    // Verify updated credits balance
    const creditsBalance = await element(by.id('credits-balance')).getText();
    expect(parseInt(creditsBalance)).toBeLessThan(100); // Assuming initial balance was 100
  });

  it('should show redeemed rewards in profile', async () => {
    await element(by.text('Profile')).tap();
    await element(by.text('My Rewards')).tap();
    
    // Verify redeemed reward is shown
    await expect(element(by.text('10% Off Grocery Order'))).toBeVisible();
    await expect(element(by.text('Expires in 30 days'))).toBeVisible();
  });

  it('should prevent redeeming when insufficient credits', async () => {
    await element(by.text('Rewards')).tap();
    await element(by.text('Gift Cards')).tap();
    await element(by.text('$50 Amazon Gift Card')).tap();
    
    // Try to redeem expensive reward
    await element(by.text('Redeem Reward')).tap();
    
    // Verify insufficient credits message
    await expect(element(by.text('Insufficient Credits'))).toBeVisible();
  });

  it('should show reward redemption history', async () => {
    await element(by.text('Profile')).tap();
    await element(by.text('Redemption History')).tap();
    
    // Verify history is shown
    await expect(element(by.text('Redemption History'))).toBeVisible();
    await expect(element(by.text('10% Off Grocery Order'))).toBeVisible();
  });

  it('should display credit earning history', async () => {
    await element(by.text('Profile')).tap();
    await element(by.text('Credit History')).tap();
    
    // Verify credit history is shown
    await expect(element(by.text('Credit History'))).toBeVisible();
    await expect(element(by.text('Collection Completed'))).toBeVisible();
  });
}); 