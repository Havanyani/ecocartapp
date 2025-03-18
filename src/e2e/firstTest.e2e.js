describe('EcoCart App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show home screen on launch', async () => {
    await expect(element(by.text('Welcome back!'))).toBeVisible();
  });

  it('should navigate to schedule screen', async () => {
    await element(by.text('Schedule Collection')).tap();
    await expect(element(by.text('Schedule Plastic Collection'))).toBeVisible();
  });

  it('should complete collection scheduling flow', async () => {
    await element(by.text('Schedule Collection')).tap();
    await element(by.text('09:00-12:00')).tap();
    await element(by.text('Confirm Collection')).tap();
    await expect(element(by.text('Collection Scheduled!'))).toBeVisible();
  });
}); 