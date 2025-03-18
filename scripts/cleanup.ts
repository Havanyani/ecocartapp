import fs from 'fs';
import path from 'path';

interface FileMapping {
  js: string;
  ts: string;
}

const filesToDelete: FileMapping[] = [
  // Utils
  {
    js: 'src/utils/PerformanceBenchmark.js',
    ts: 'src/utils/Performance.ts'
  },
  {
    js: 'src/utils/BenchmarkScenarios.js',
    ts: 'src/utils/BenchmarkScenarios.ts'
  },
  {
    js: 'src/utils/RetryManager.js',
    ts: 'src/utils/RetryManager.ts'
  },
  {
    js: 'src/utils/RouteOptimizer.js',
    ts: 'src/utils/RouteOptimizer.ts'
  },
  // Screens
  {
    js: 'src/screens/ProfileScreen.js',
    ts: 'src/screens/ProfileScreen.tsx'
  },
  {
    js: 'src/screens/PerformanceMonitorScreen.js',
    ts: 'src/screens/PerformanceMonitorScreen.tsx'
  },
  {
    js: 'src/screens/OrdersScreen.js',
    ts: 'src/screens/OrdersScreen.tsx'
  },
  {
    js: 'src/screens/CollectionHistoryScreen.js',
    ts: 'src/screens/CollectionHistoryScreen.tsx'
  },
  {
    js: 'src/screens/PerformanceSettingsScreen.js',
    ts: 'src/screens/PerformanceSettingsScreen.tsx'
  },
  {
    js: 'src/screens/PaymentMethodsScreen.js',
    ts: 'src/screens/PaymentMethodsScreen.tsx'
  },
  {
    js: 'src/screens/CommunityScreen.js',
    ts: 'src/screens/CommunityScreen.tsx'
  },
  {
    js: 'src/screens/AnalyticsDashboardScreen.js',
    ts: 'src/screens/AnalyticsDashboardScreen.tsx'
  },
  {
    js: 'src/screens/DeliveryPersonnelScreen.js',
    ts: 'src/screens/DeliveryPersonnelScreen.tsx'
  },
  {
    js: 'src/screens/PlasticCollectionScreen.js',
    ts: 'src/screens/PlasticCollectionScreen.tsx'
  },
  {
    js: 'src/screens/ProductListScreen.js',
    ts: 'src/screens/ProductListScreen.tsx'
  },
  {
    js: 'src/screens/ProductDetailScreen.js',
    ts: 'src/screens/ProductDetailScreen.tsx'
  }
];

function createBackup(filePath: string): void {
  const backupDir = path.join(process.cwd(), 'backups', path.dirname(filePath));
  const backupPath = path.join(backupDir, `${path.basename(filePath)}.bak`);

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Copy file to backup location
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup: ${backupPath}`);
}

function verifyTypeScriptFile(mapping: FileMapping): boolean {
  try {
    const jsContent = fs.readFileSync(mapping.js, 'utf-8');
    const tsContent = fs.readFileSync(mapping.ts, 'utf-8');

    // For screens and components, we expect the TypeScript files to be larger
    // due to added types, interfaces, and enhanced functionality
    const minRatio = mapping.js.includes('screens/') ? 1.2 : 0.8;

    const jsLines = jsContent.split('\n').length;
    const tsLines = tsContent.split('\n').length;

    if (tsLines < jsLines * minRatio) {
      console.warn(`Warning: ${mapping.ts} might be missing content from ${mapping.js}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error verifying files: ${error}`);
    return false;
  }
}

function cleanup(): void {
  console.log('Starting cleanup process...');
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  filesToDelete.forEach(mapping => {
    const jsPath = path.join(process.cwd(), mapping.js);
    
    if (fs.existsSync(jsPath)) {
      try {
        console.log(`Processing: ${jsPath}`);
        createBackup(jsPath);

        if (verifyTypeScriptFile(mapping)) {
          fs.unlinkSync(jsPath);
          console.log(`✓ Deleted: ${jsPath}`);
          successCount++;
        } else {
          console.log(`⚠ Skipped deletion of ${jsPath} - verification failed`);
          skipCount++;
        }
      } catch (error) {
        console.error(`✗ Error processing ${jsPath}: ${error}`);
        errorCount++;
      }
    } else {
      console.log(`! File not found: ${jsPath}`);
      skipCount++;
    }
  });

  console.log('\nCleanup Summary:');
  console.log(`✓ Successfully deleted: ${successCount} files`);
  console.log(`⚠ Skipped: ${skipCount} files`);
  console.log(`✗ Errors: ${errorCount} files`);
  console.log('\nBackups can be found in the "backups" directory');
}

// Run cleanup
cleanup(); 