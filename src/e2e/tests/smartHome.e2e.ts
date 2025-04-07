/// <reference types="detox" />

import { by, device, element, expect } from 'detox';

describe('Smart Home', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'always' }
    });
    
    // Login to the app first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen to load
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Navigate to Smart Home screen
    await element(by.id('tab-smart-home')).tap();
  });

  beforeEach(async () => {
    // Return to Smart Home main screen before each test
    await device.reloadReactNative();
    await element(by.id('tab-smart-home')).tap();
  });

  it('should display the smart home dashboard', async () => {
    await expect(element(by.id('smart-home-screen'))).toBeVisible();
    await expect(element(by.id('devices-summary'))).toBeVisible();
    await expect(element(by.id('energy-usage-chart'))).toBeVisible();
    await expect(element(by.id('add-device-button'))).toBeVisible();
  });

  it('should open device integration flow', async () => {
    await element(by.id('add-device-button')).tap();
    
    // Verify platform selection screen
    await expect(element(by.id('platform-selection-screen'))).toBeVisible();
    await expect(element(by.id('platform-samsung'))).toBeVisible();
    await expect(element(by.id('platform-philips'))).toBeVisible();
    await expect(element(by.id('platform-nest'))).toBeVisible();
    
    // Select a platform
    await element(by.id('platform-philips')).tap();
    
    // Verify authorization screen 
    await expect(element(by.id('oauth-screen'))).toBeVisible();
    
    // Go back to smart home dashboard
    await element(by.id('cancel-button')).tap();
    await expect(element(by.id('smart-home-screen'))).toBeVisible();
  });

  it('should display device details when a device is selected', async () => {
    // Assuming there's at least one connected device
    await element(by.id('device-item-0')).tap();
    
    // Verify device details screen
    await expect(element(by.id('device-details-screen'))).toBeVisible();
    await expect(element(by.id('device-name'))).toBeVisible();
    await expect(element(by.id('device-status'))).toBeVisible();
    await expect(element(by.id('device-controls'))).toBeVisible();
    
    // Test device controls
    await element(by.id('power-toggle')).tap();
    
    // Verify status changed
    await expect(element(by.id('device-status'))).toHaveText('On');
    
    // Go back to smart home dashboard
    await element(by.id('back-button')).tap();
  });

  it('should allow filtering devices by category', async () => {
    await element(by.id('filter-button')).tap();
    
    // Select lighting category
    await element(by.id('category-lighting')).tap();
    await element(by.id('apply-filters-button')).tap();
    
    // Verify only lighting devices are shown
    await expect(element(by.text('Bedroom Light'))).toBeVisible();
    await expect(element(by.text('Living Room Light'))).toBeVisible();
    
    // Clear filters
    await element(by.id('clear-filters-button')).tap();
  });

  it('should display energy usage statistics', async () => {
    await element(by.id('energy-tab')).tap();
    
    // Verify energy usage screen elements
    await expect(element(by.id('energy-screen'))).toBeVisible();
    await expect(element(by.id('total-energy-saved'))).toBeVisible();
    await expect(element(by.id('energy-history-chart'))).toBeVisible();
    await expect(element(by.id('carbon-footprint'))).toBeVisible();
  });

  it('should allow creating automation routines', async () => {
    await element(by.id('automation-tab')).tap();
    
    // Verify automation screen
    await expect(element(by.id('automation-screen'))).toBeVisible();
    
    // Create new automation
    await element(by.id('create-automation-button')).tap();
    
    // Verify automation creation screen
    await expect(element(by.id('automation-creation-screen'))).toBeVisible();
    
    // Name the automation
    await element(by.id('automation-name-input')).typeText('Night Mode');
    
    // Add a trigger
    await element(by.id('add-trigger-button')).tap();
    await element(by.id('trigger-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('10:00 PM', 'hh:mm a');
    await element(by.id('save-trigger-button')).tap();
    
    // Add an action
    await element(by.id('add-action-button')).tap();
    await element(by.id('select-device-dropdown')).tap();
    await element(by.text('Living Room Light')).tap();
    await element(by.id('action-turn-off')).tap();
    await element(by.id('save-action-button')).tap();
    
    // Save the automation
    await element(by.id('save-automation-button')).tap();
    
    // Verify automation appears in the list
    await expect(element(by.text('Night Mode'))).toBeVisible();
  });
}); 