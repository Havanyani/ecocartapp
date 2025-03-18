# App Store Assets

This directory contains all the assets needed for publishing the EcoCart app to the App Store and Google Play Store.

## Directory Structure

- `app-icon/` - App icons for iOS and Android
- `screenshots/` - Screenshots of the app for different device sizes
- `promotional/` - Promotional graphics for store listings
- `metadata/` - App metadata like descriptions and keywords

## App Icon

The app icon is available in various sizes required by the App Store and Google Play Store. The source file is in the `app-icon/source` directory.

### iOS Icon Sizes

- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone Spotlight)
- 80x80 (Spotlight)
- 76x76 (iPad)
- 60x60 (iPhone Settings)
- 58x58 (Settings)
- 40x40 (Spotlight)
- 29x29 (Settings)
- 20x20 (Notification)

### Android Icon Sizes

- 512x512 (Google Play)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

## Screenshots

Screenshots are organized by platform and device size:

### iOS Screenshots

- `ios/iphone-6.5/` - iPhone 13 Pro Max (1284x2778)
- `ios/iphone-5.5/` - iPhone 8 Plus (1242x2208)
- `ios/ipad-12.9/` - iPad Pro 12.9" (2048x2732)

### Android Screenshots

- `android/phone/` - Standard phone size (1080x1920)
- `android/tablet-7/` - 7" tablet (1080x1920)
- `android/tablet-10/` - 10" tablet (1920x1200)

## Promotional Graphics

- `feature-graphic.png` - Featured graphic for Google Play (1024x500)
- `promo-banner.png` - Promotional banner for App Store (1200x628)
- `app-store-icon.png` - App Store icon (1024x1024)
- `play-store-icon.png` - Play Store icon (512x512)

## Metadata

The metadata directory contains text-based assets for the app store listings:

- `app-name.txt` - The name of the app (50 chars max)
- `short-description.txt` - A short description (80 chars max)
- `long-description.txt` - A detailed description (4000 chars max)
- `keywords.txt` - Keywords for App Store search optimization
- `whats-new.txt` - What's new in the latest version
- `privacy-policy.txt` - Privacy policy
- `support-url.txt` - Support URL

## Guidelines

When creating assets for the app stores, please follow these guidelines:

1. **App Icon**
   - Maintain brand consistency across all icons
   - Avoid text in the icon
   - Use the template in the source directory

2. **Screenshots**
   - Use the provided templates in each screenshot directory
   - Show the most important features of the app
   - Use localized content when applicable

3. **Descriptions**
   - Focus on benefits, not just features
   - Include keywords naturally
   - Highlight unique selling points
   - Keep it concise and readable

## Generating Assets

You can generate all the required assets using the following tools:

- App Icons: [App Icon Generator](https://appicon.co/)
- Screenshots: [Screenshot App](https://shotbot.io/)
- Feature Graphics: Templates in Figma/Sketch

## Submission Checklist

Before submitting to the app stores, ensure you have:

- [ ] App icons in all required sizes
- [ ] Screenshots for all required device sizes
- [ ] Feature graphic and promotional images
- [ ] App name, descriptions, and keywords
- [ ] Privacy policy
- [ ] Support and marketing URLs 