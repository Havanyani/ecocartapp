/**
 * EcoCart App Icon Generator Script
 * 
 * This script generates app icons in all required sizes for iOS and Android app store submission.
 * It creates icons for both platforms from a source image and also prepares app store submission icons.
 * 
 * Installation:
 * npm install sharp
 * 
 * Usage:
 * node scripts/generate-app-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directories for storing generated icons
const IOS_DIR = './app-store-assets/images/ios';
const ANDROID_DIR = './app-store-assets/images/android';
const STORE_DIR = './app-store-assets/images/app-store';

// Source icon path
const SOURCE_ICON = './assets/icon.png';

// Create directories if they don't exist
function ensureDirectoryExistence(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// iOS icon sizes (in pixels)
const IOS_SIZES = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

// Android icon sizes (in pixels)
const ANDROID_SIZES = [36, 48, 72, 96, 144, 192, 512];

// Store submission icons
const STORE_ICONS = [
  { platform: 'iOS App Store', size: 1024, filename: 'app-store-icon.png' },
  { platform: 'Google Play Store', size: 512, filename: 'play-store-icon.png' }
];

// Generate iOS icons
async function generateIOSIcons() {
  console.log('Generating iOS icons...');
  
  for (const size of IOS_SIZES) {
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(IOS_DIR, `icon-${size}.png`));
      
      console.log(`Generated iOS icon: ${size}x${size}`);
    } catch (error) {
      console.error(`Error generating iOS icon ${size}x${size}:`, error);
    }
  }
}

// Generate Android icons
async function generateAndroidIcons() {
  console.log('Generating Android icons...');
  
  for (const size of ANDROID_SIZES) {
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(ANDROID_DIR, `icon-${size}.png`));
      
      console.log(`Generated Android icon: ${size}x${size}`);
    } catch (error) {
      console.error(`Error generating Android icon ${size}x${size}:`, error);
    }
  }
}

// Generate app store submission icons
async function generateStoreIcons() {
  console.log('Generating app store submission icons...');
  
  for (const icon of STORE_ICONS) {
    try {
      await sharp(SOURCE_ICON)
        .resize(icon.size, icon.size)
        .toFile(path.join(STORE_DIR, icon.filename));
      
      console.log(`Generated ${icon.platform} icon: ${icon.size}x${icon.size}`);
    } catch (error) {
      console.error(`Error generating ${icon.platform} icon:`, error);
    }
  }
}

// Main function
async function generateAllIcons() {
  console.log('EcoCart App Icon Generator');
  console.log('=========================');
  
  // Ensure directories exist
  ensureDirectoryExistence(IOS_DIR);
  ensureDirectoryExistence(ANDROID_DIR);
  ensureDirectoryExistence(STORE_DIR);
  
  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Error: Source icon not found at ${SOURCE_ICON}`);
    console.log('Please ensure your icon is located at ./assets/icon.png');
    return;
  }
  
  console.log(`Using source icon: ${SOURCE_ICON}`);
  
  // Generate all icons
  await generateIOSIcons();
  await generateAndroidIcons();
  await generateStoreIcons();
  
  console.log('');
  console.log('Icon generation complete!');
  console.log('');
  console.log('iOS icons saved to: ' + IOS_DIR);
  console.log('Android icons saved to: ' + ANDROID_DIR);
  console.log('App Store icons saved to: ' + STORE_DIR);
}

// Run the script
generateAllIcons().catch(error => {
  console.error('Error generating icons:', error);
}); 