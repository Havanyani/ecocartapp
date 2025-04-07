const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../app-store-assets');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');
const ICONS_DIR = path.join(ASSETS_DIR, 'images');

// iOS screenshot sizes
const IOS_SCREENSHOTS = {
  'iPhone 6.7"': { width: 1290, height: 2796 },
  'iPhone 6.5"': { width: 1242, height: 2688 },
  'iPhone 5.5"': { width: 1242, height: 2208 },
  'iPad 12.9"': { width: 2048, height: 2732 },
  'iPad 11"': { width: 1668, height: 2388 },
  'iPad 10.5"': { width: 1668, height: 2224 }
};

// Android screenshot sizes
const ANDROID_SCREENSHOTS = {
  'Phone': { width: 1080, height: 1920 },
  '7" Tablet': { width: 1600, height: 2560 },
  '10" Tablet': { width: 1700, height: 2560 }
};

// Icon sizes
const ICON_SIZES = {
  ios: [20, 29, 40, 58, 60, 76, 83.5, 1024],
  android: [48, 72, 96, 144, 192, 512]
};

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateScreenshots(sourceImage, platform) {
  const sizes = platform === 'ios' ? IOS_SCREENSHOTS : ANDROID_SCREENSHOTS;
  const platformDir = path.join(SCREENSHOTS_DIR, platform);
  
  await ensureDirectoryExists(platformDir);

  for (const [device, dimensions] of Object.entries(sizes)) {
    const outputPath = path.join(platformDir, `${device.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`);
    
    await sharp(sourceImage)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    console.log(`Generated ${device} screenshot for ${platform}`);
  }
}

async function generateIcons(sourceIcon) {
  // iOS icons
  const iosDir = path.join(ICONS_DIR, 'ios');
  await ensureDirectoryExists(iosDir);

  for (const size of ICON_SIZES.ios) {
    const outputPath = path.join(iosDir, `icon-${size}.png`);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(outputPath);
    
    console.log(`Generated iOS icon size ${size}`);
  }

  // Android icons
  const androidDir = path.join(ICONS_DIR, 'android');
  await ensureDirectoryExists(androidDir);

  for (const size of ICON_SIZES.android) {
    const outputPath = path.join(androidDir, `icon-${size}.png`);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(outputPath);
    
    console.log(`Generated Android icon size ${size}`);
  }
}

async function generateFeatureGraphic(sourceImage) {
  const outputPath = path.join(ICONS_DIR, 'android', 'feature-graphic.png');
  
  await sharp(sourceImage)
    .resize(1024, 500, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(outputPath);
  
  console.log('Generated Android feature graphic');
}

async function main() {
  try {
    // Ensure source images exist
    const sourceScreenshot = path.join(ASSETS_DIR, 'source', 'screenshot.png');
    const sourceIcon = path.join(ASSETS_DIR, 'source', 'icon.png');
    const sourceFeatureGraphic = path.join(ASSETS_DIR, 'source', 'feature-graphic.png');

    // Generate screenshots
    await generateScreenshots(sourceScreenshot, 'ios');
    await generateScreenshots(sourceScreenshot, 'android');

    // Generate icons
    await generateIcons(sourceIcon);

    // Generate feature graphic
    await generateFeatureGraphic(sourceFeatureGraphic);

    console.log('Successfully generated all store assets');
  } catch (error) {
    console.error('Error generating store assets:', error);
    process.exit(1);
  }
}

main(); 