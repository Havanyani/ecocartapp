const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '../app-store-assets');
const METADATA_DIR = path.join(ASSETS_DIR, 'metadata');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');
const ICONS_DIR = path.join(ASSETS_DIR, 'images');

// Required files and directories
const REQUIRED_FILES = {
  ios: {
    metadata: [
      'app-store-metadata.json',
      'privacy-policy.txt',
      'support-url.txt'
    ],
    screenshots: [
      'iphone-6-7.png',
      'iphone-6-5.png',
      'iphone-5-5.png',
      'ipad-12-9.png',
      'ipad-11.png',
      'ipad-10-5.png'
    ],
    icons: [
      'icon-20.png',
      'icon-29.png',
      'icon-40.png',
      'icon-58.png',
      'icon-60.png',
      'icon-76.png',
      'icon-83-5.png',
      'icon-1024.png'
    ]
  },
  android: {
    metadata: [
      'play-store-metadata.json',
      'privacy-policy.txt',
      'support-url.txt'
    ],
    screenshots: [
      'phone.png',
      '7-tablet.png',
      '10-tablet.png'
    ],
    icons: [
      'icon-48.png',
      'icon-72.png',
      'icon-96.png',
      'icon-144.png',
      'icon-192.png',
      'icon-512.png'
    ],
    featureGraphic: ['feature-graphic.png']
  }
};

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateMetadata(platform) {
  const metadataFiles = REQUIRED_FILES[platform].metadata;
  const missingFiles = [];

  for (const file of metadataFiles) {
    const filePath = path.join(METADATA_DIR, file);
    if (!await checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  }

  return missingFiles;
}

async function validateScreenshots(platform) {
  const screenshotFiles = REQUIRED_FILES[platform].screenshots;
  const missingFiles = [];

  for (const file of screenshotFiles) {
    const filePath = path.join(SCREENSHOTS_DIR, platform, file);
    if (!await checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  }

  return missingFiles;
}

async function validateIcons(platform) {
  const iconFiles = REQUIRED_FILES[platform].icons;
  const missingFiles = [];

  for (const file of iconFiles) {
    const filePath = path.join(ICONS_DIR, platform, file);
    if (!await checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  }

  return missingFiles;
}

async function validateFeatureGraphic() {
  const featureGraphicFiles = REQUIRED_FILES.android.featureGraphic;
  const missingFiles = [];

  for (const file of featureGraphicFiles) {
    const filePath = path.join(ICONS_DIR, 'android', file);
    if (!await checkFileExists(filePath)) {
      missingFiles.push(file);
    }
  }

  return missingFiles;
}

async function validateAppJson() {
  try {
    const appJsonPath = path.join(__dirname, '../app.json');
    const appJson = JSON.parse(await fs.readFile(appJsonPath, 'utf8'));

    const requiredFields = {
      ios: [
        'bundleIdentifier',
        'buildNumber',
        'infoPlist.NSLocationWhenInUseUsageDescription',
        'infoPlist.NSCameraUsageDescription',
        'infoPlist.NSPhotoLibraryUsageDescription'
      ],
      android: [
        'package',
        'versionCode',
        'permissions'
      ]
    };

    const missingFields = {
      ios: [],
      android: []
    };

    // Check iOS fields
    for (const field of requiredFields.ios) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], appJson.expo.ios);
      if (!value) {
        missingFields.ios.push(field);
      }
    }

    // Check Android fields
    for (const field of requiredFields.android) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], appJson.expo.android);
      if (!value) {
        missingFields.android.push(field);
      }
    }

    return missingFields;
  } catch (error) {
    console.error('Error validating app.json:', error);
    return null;
  }
}

async function validateEasJson() {
  try {
    const easJsonPath = path.join(__dirname, '../eas.json');
    const easJson = JSON.parse(await fs.readFile(easJsonPath, 'utf8'));

    const requiredFields = {
      submit: {
        production: {
          ios: ['appleId', 'ascAppId', 'appleTeamId'],
          android: ['serviceAccountKeyPath', 'track']
        }
      }
    };

    const missingFields = {
      ios: [],
      android: []
    };

    // Check iOS fields
    for (const field of requiredFields.submit.production.ios) {
      if (!easJson.submit?.production?.ios?.[field]) {
        missingFields.ios.push(field);
      }
    }

    // Check Android fields
    for (const field of requiredFields.submit.production.android) {
      if (!easJson.submit?.production?.android?.[field]) {
        missingFields.android.push(field);
      }
    }

    return missingFields;
  } catch (error) {
    console.error('Error validating eas.json:', error);
    return null;
  }
}

async function main() {
  console.log('Validating app store submission requirements...\n');

  // Validate iOS requirements
  console.log('iOS Requirements:');
  const iosMetadataMissing = await validateMetadata('ios');
  const iosScreenshotsMissing = await validateScreenshots('ios');
  const iosIconsMissing = await validateIcons('ios');

  if (iosMetadataMissing.length > 0) {
    console.log('❌ Missing iOS metadata files:');
    iosMetadataMissing.forEach(file => console.log(`  - ${file}`));
  }

  if (iosScreenshotsMissing.length > 0) {
    console.log('❌ Missing iOS screenshots:');
    iosScreenshotsMissing.forEach(file => console.log(`  - ${file}`));
  }

  if (iosIconsMissing.length > 0) {
    console.log('❌ Missing iOS icons:');
    iosIconsMissing.forEach(file => console.log(`  - ${file}`));
  }

  // Validate Android requirements
  console.log('\nAndroid Requirements:');
  const androidMetadataMissing = await validateMetadata('android');
  const androidScreenshotsMissing = await validateScreenshots('android');
  const androidIconsMissing = await validateIcons('android');
  const androidFeatureGraphicMissing = await validateFeatureGraphic();

  if (androidMetadataMissing.length > 0) {
    console.log('❌ Missing Android metadata files:');
    androidMetadataMissing.forEach(file => console.log(`  - ${file}`));
  }

  if (androidScreenshotsMissing.length > 0) {
    console.log('❌ Missing Android screenshots:');
    androidScreenshotsMissing.forEach(file => console.log(`  - ${file}`));
  }

  if (androidIconsMissing.length > 0) {
    console.log('❌ Missing Android icons:');
    androidIconsMissing.forEach(file => console.log(`  - ${file}`));
  }

  if (androidFeatureGraphicMissing.length > 0) {
    console.log('❌ Missing Android feature graphic:');
    androidFeatureGraphicMissing.forEach(file => console.log(`  - ${file}`));
  }

  // Validate configuration files
  console.log('\nConfiguration Files:');
  const appJsonMissing = await validateAppJson();
  const easJsonMissing = await validateEasJson();

  if (appJsonMissing) {
    if (appJsonMissing.ios.length > 0) {
      console.log('❌ Missing iOS app.json fields:');
      appJsonMissing.ios.forEach(field => console.log(`  - ${field}`));
    }

    if (appJsonMissing.android.length > 0) {
      console.log('❌ Missing Android app.json fields:');
      appJsonMissing.android.forEach(field => console.log(`  - ${field}`));
    }
  }

  if (easJsonMissing) {
    if (easJsonMissing.ios.length > 0) {
      console.log('❌ Missing iOS eas.json fields:');
      easJsonMissing.ios.forEach(field => console.log(`  - ${field}`));
    }

    if (easJsonMissing.android.length > 0) {
      console.log('❌ Missing Android eas.json fields:');
      easJsonMissing.android.forEach(field => console.log(`  - ${field}`));
    }
  }

  // Check if there are any missing requirements
  const hasMissingRequirements = [
    iosMetadataMissing,
    iosScreenshotsMissing,
    iosIconsMissing,
    androidMetadataMissing,
    androidScreenshotsMissing,
    androidIconsMissing,
    androidFeatureGraphicMissing,
    appJsonMissing?.ios || [],
    appJsonMissing?.android || [],
    easJsonMissing?.ios || [],
    easJsonMissing?.android || []
  ].some(arr => arr.length > 0);

  if (hasMissingRequirements) {
    console.log('\n❌ Some submission requirements are missing. Please address the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All submission requirements are met!');
  }
}

main(); 