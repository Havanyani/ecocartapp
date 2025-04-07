import { by, device, element, expect, waitFor } from 'detox';

describe('App Initialization', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true }); // Clean start for timing accuracy
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show loading screen on app launch', async () => {
    // Wait for loading screen to appear
    await waitFor(element(by.text('EcoCart')))
      .toBeVisible()
      .withTimeout(5000);

    // Should show tagline
    await expect(element(by.text('Making sustainability simple'))).toBeVisible();
    
    // Should show progress bar
    await expect(element(by.id('progress-bar'))).toBeVisible();
  });

  it('should transition to main app after initialization', async () => {
    // Wait for loading screen to appear
    await waitFor(element(by.text('EcoCart')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Wait for loading to complete and transition to main app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should complete initialization within 5 seconds', async () => {
    const startTime = Date.now();
    
    // Wait for loading screen to appear
    await waitFor(element(by.text('EcoCart')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Wait for loading to complete and home screen to appear
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Log the initialization time for tracking
    console.log(`App initialization time: ${loadTime}ms`);
    
    // Assert that initialization completed within 5 seconds
    // Using custom expect since Detox's expect doesn't have toBeLessThan
    if (loadTime >= 5000) {
      throw new Error(`App initialization took too long: ${loadTime}ms (expected < 5000ms)`);
    }
  });
  
  it('should preload essential UI elements', async () => {
    // Wait for home screen to appear
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify essential UI elements are loaded
    await expect(element(by.id('eco-impact-section'))).toBeVisible();
    await expect(element(by.id('quick-actions-section'))).toBeVisible();
    
    // Verify tap interaction works immediately
    await element(by.id('view-detailed-impact-button')).tap();
    
    // Verify navigation works
    await expect(element(by.id('environmental-impact-screen'))).toBeVisible();
  });
  
  it('should handle offline mode gracefully', async () => {
    // Toggle airplane mode on device - implementation depends on platform
    // For demo purposes we'll just launch the app with a flag
    await device.launchApp({
      delete: false,
      newInstance: true,
      launchArgs: { isOffline: true }
    });
    
    // Should still show loading screen
    await waitFor(element(by.text('EcoCart')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Should transition to main app even when offline
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Should display offline indicator
    await expect(element(by.id('offline-indicator'))).toBeVisible();
  });
  
  it('should handle rapid app switching', async () => {
    // Launch app
    await device.launchApp({ newInstance: true });
    
    // Wait for home screen to appear
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Background app
    await device.sendToHome();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Bring app back to foreground
    await device.launchApp({ newInstance: false });
    
    // Should quickly restore the UI without full initialization
    await expect(element(by.id('home-screen'))).toBeVisible();
    await expect(element(by.text('EcoCart'))).not.toBeVisible(); // Loading screen should not appear
  });
}); 