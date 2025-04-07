/// <reference types="detox" />

import { by, device, element, expect } from 'detox';

describe('Material Collection', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'YES', location: 'always' }
    });
    
    // Login to the app first (assuming auth test passes)
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen to load
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Navigate to Collection screen
    await element(by.id('tab-collection')).tap();
  });

  beforeEach(async () => {
    // Reset to Collection main screen before each test
    await device.reloadReactNative();
    await element(by.id('tab-collection')).tap();
  });

  it('should display the material collection screen', async () => {
    await expect(element(by.id('collection-screen'))).toBeVisible();
    await expect(element(by.id('scan-button'))).toBeVisible();
    await expect(element(by.id('material-list'))).toBeVisible();
  });

  it('should allow searching for materials', async () => {
    await element(by.id('search-input')).typeText('plastic');
    await element(by.id('search-button')).tap();
    
    // Verify search results
    await expect(element(by.id('search-results'))).toBeVisible();
    await expect(element(by.text('Plastic Bottle'))).toBeVisible();
  });

  it('should navigate to AR scanner when scan button is pressed', async () => {
    await element(by.id('scan-button')).tap();
    
    // Verify AR scanner is visible
    await expect(element(by.id('ar-scanner-screen'))).toBeVisible();
    await expect(element(by.id('camera-view'))).toBeVisible();
    
    // Go back to material collection
    await element(by.id('back-button')).tap();
  });

  it('should show material details when a material is selected', async () => {
    // First search for a material
    await element(by.id('search-input')).typeText('aluminum');
    await element(by.id('search-button')).tap();
    
    // Select the first material
    await element(by.id('material-item-0')).tap();
    
    // Verify material details are shown
    await expect(element(by.id('material-details-screen'))).toBeVisible();
    await expect(element(by.id('material-name'))).toBeVisible();
    await expect(element(by.id('recycling-instructions'))).toBeVisible();
    await expect(element(by.id('points-value'))).toBeVisible();
    
    // Test the add to collection button
    await element(by.id('add-to-collection-button')).tap();
    await expect(element(by.text('Added to your collection'))).toBeVisible();
  });

  it('should allow filtering materials by category', async () => {
    await element(by.id('filter-button')).tap();
    
    // Select plastic category
    await element(by.id('category-plastic')).tap();
    await element(by.id('apply-filters-button')).tap();
    
    // Verify only plastic materials are shown
    await expect(element(by.text('Plastic Bottle'))).toBeVisible();
    await expect(element(by.text('Plastic Container'))).toBeVisible();
    
    // Clear filters
    await element(by.id('clear-filters-button')).tap();
  });

  it('should display user collection history', async () => {
    await element(by.id('history-tab')).tap();
    
    // Verify history screen elements
    await expect(element(by.id('collection-history'))).toBeVisible();
    await expect(element(by.id('total-points'))).toBeVisible();
    await expect(element(by.id('history-list'))).toBeVisible();
  });
}); 