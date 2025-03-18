import { by, device, element, expect, waitFor } from 'detox';

describe('Analytics Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to analytics and display data', async () => {
    // Navigate to Analytics screen
    await element(by.id('nav-analytics')).tap();

    // Wait for the analytics screen to load
    await expect(element(by.text('Advanced Analytics'))).toBeVisible();

    // Check if all metric categories are visible
    await expect(element(by.text('Usage'))).toBeVisible();
    await expect(element(by.text('Performance'))).toBeVisible();
    await expect(element(by.text('Engagement'))).toBeVisible();

    // Switch between metric categories
    await element(by.text('Performance')).tap();
    await expect(element(by.text('Load Time'))).toBeVisible();
    await expect(element(by.text('Error Rate'))).toBeVisible();
    await expect(element(by.text('Memory Usage'))).toBeVisible();

    await element(by.text('Engagement')).tap();
    await expect(element(by.text('Retention'))).toBeVisible();
    await expect(element(by.text('Conversion'))).toBeVisible();
    await expect(element(by.text('Satisfaction'))).toBeVisible();

    // Change time range
    await element(by.text('Month')).tap();
    await expect(element(by.id('trend-analysis-chart'))).toBeVisible();
    await expect(element(by.id('metric-distribution-chart'))).toBeVisible();

    // Check if charts are interactive
    await element(by.id('trend-analysis-chart')).swipe('left');
    await element(by.id('trend-analysis-chart')).swipe('right');
  });

  it('should handle loading and error states', async () => {
    // Navigate to Analytics screen
    await element(by.id('nav-analytics')).tap();

    // Simulate loading state
    await expect(element(by.id('loading-indicator'))).toBeVisible();

    // Wait for data to load
    await waitFor(element(by.text('Advanced Analytics')))
      .toBeVisible()
      .withTimeout(5000);

    // Simulate error state
    await element(by.id('error-retry-button')).tap();
    await expect(element(by.text('Failed to load analytics data'))).toBeVisible();
  });

  it('should persist time range selection', async () => {
    // Navigate to Analytics screen
    await element(by.id('nav-analytics')).tap();

    // Select month view
    await element(by.text('Month')).tap();

    // Reload the app
    await device.reloadReactNative();

    // Navigate back to Analytics
    await element(by.id('nav-analytics')).tap();

    // Verify time range is still set to month
    await expect(element(by.text('Month')).props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
      })
    );
  });
}); 