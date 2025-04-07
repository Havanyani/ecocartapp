#!/usr/bin/env node

/**
 * EcoCart CI Local Environment Check
 * 
 * This script checks if your local environment is configured correctly for the CI pipeline.
 * It verifies dependencies, environment variables, and configuration files.
 * 
 * Usage:
 * node scripts/ci-local-check.js [options]
 * 
 * Options:
 *   --eas-only       Only check EAS configuration
 *   --full           Run all checks including extensive test validation
 *   --fix            Attempt to fix common issues
 *   --help           Show this help message
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  easOnly: args.includes('--eas-only'),
  fullCheck: args.includes('--full'),
  fix: args.includes('--fix'),
  help: args.includes('--help')
};

if (options.help) {
  console.log(`
EcoCart CI Local Environment Check

This script checks if your local environment is configured correctly for the CI pipeline.
It verifies dependencies, environment variables, and configuration files.

Usage:
node scripts/ci-local-check.js [options]

Options:
  --eas-only       Only check EAS configuration
  --full           Run all checks including extensive test validation
  --fix            Attempt to fix common issues
  --help           Show this help message
  `);
  process.exit(0);
}

// Check if chalk is installed, if not use simple strings
let log = {
  info: (msg) => console.log(`INFO: ${msg}`),
  success: (msg) => console.log(`SUCCESS: ${msg}`),
  warning: (msg) => console.log(`WARNING: ${msg}`),
  error: (msg) => console.log(`ERROR: ${msg}`),
  title: (msg) => console.log(`\n${msg}\n${'-'.repeat(msg.length)}\n`)
};

try {
  if (require.resolve('chalk')) {
    log = {
      info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
      success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
      warning: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
      error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
      title: (msg) => console.log(chalk.bold.cyan(`\n${msg}\n${'-'.repeat(msg.length)}\n`))
    };
  }
} catch (err) {
  console.log('Chalk not installed, using plain console output.');
  console.log('Install chalk for colored output: npm install chalk');
}

// Required files for CI
const requiredFiles = [
  { path: '.github/workflows/ecocart-pipeline.yml', description: 'CI/CD Pipeline configuration' },
  { path: 'eas.json', description: 'EAS Build configuration' },
  { path: 'app.json', description: 'Expo app configuration' },
  { path: 'package.json', description: 'Project dependencies' }
];

// Required npm scripts
const requiredScripts = [
  { name: 'test', description: 'Run tests' },
  { name: 'lint', description: 'Run linting' },
  { name: 'build', description: 'Build the app', optional: true },
  { name: 'start', description: 'Start the development server' }
];

// Required dependencies
const requiredDependencies = [
  { name: 'expo', dev: false, description: 'Expo SDK' },
  { name: 'expo-updates', dev: false, description: 'Expo Updates for OTA' },
  { name: 'jest', dev: true, description: 'Testing framework' },
  { name: 'eslint', dev: true, description: 'Code linting' },
  { name: 'typescript', dev: true, description: 'TypeScript compiler' },
  { name: '@types/react', dev: true, description: 'React TypeScript definitions' },
  { name: '@testing-library/react-native', dev: true, description: 'Testing utilities' }
];

// Required env variables for CI
const requiredEnvVars = [
  { name: 'EXPO_TOKEN', description: 'Expo access token for CI' }
];

// Utility to check if a file exists
function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

// Utility to get package.json content
function getPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  }
  return null;
}

// Utility to run a shell command and return the output
function runCommand(command, silent = false) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) {
      log.error(`Failed to run command: ${command}`);
      log.error(error.message);
    }
    return null;
  }
}

// Check if required files exist
function checkRequiredFiles() {
  log.title('Checking Required Files');
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (checkFileExists(file.path)) {
      log.success(`${file.path} exists (${file.description})`);
    } else {
      log.error(`${file.path} is missing (${file.description})`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Check required npm scripts
function checkRequiredScripts() {
  log.title('Checking Required npm Scripts');
  
  const packageJson = getPackageJson();
  if (!packageJson) {
    log.error('package.json not found or invalid');
    return false;
  }
  
  let allScriptsExist = true;
  
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script.name]) {
      log.success(`Script '${script.name}' exists: ${packageJson.scripts[script.name]}`);
    } else if (script.optional) {
      log.warning(`Optional script '${script.name}' is missing (${script.description})`);
    } else {
      log.error(`Script '${script.name}' is missing (${script.description})`);
      allScriptsExist = false;
    }
  }
  
  return allScriptsExist;
}

// Check required dependencies
function checkRequiredDependencies() {
  log.title('Checking Required Dependencies');
  
  const packageJson = getPackageJson();
  if (!packageJson) {
    log.error('package.json not found or invalid');
    return false;
  }
  
  let allDepsExist = true;
  
  for (const dep of requiredDependencies) {
    const depType = dep.dev ? 'devDependencies' : 'dependencies';
    
    if (packageJson[depType] && packageJson[depType][dep.name]) {
      log.success(`${dep.name}@${packageJson[depType][dep.name]} found in ${depType}`);
    } else {
      log.error(`${dep.name} is missing in ${depType} (${dep.description})`);
      allDepsExist = false;
      
      if (options.fix) {
        log.info(`Attempting to install ${dep.name}...`);
        const installCmd = `npm install ${dep.dev ? '--save-dev' : '--save'} ${dep.name}`;
        runCommand(installCmd);
      }
    }
  }
  
  return allDepsExist;
}

// Check EAS configuration
function checkEasConfig() {
  log.title('Checking EAS Configuration');
  
  const easJsonPath = path.join(process.cwd(), 'eas.json');
  if (!fs.existsSync(easJsonPath)) {
    log.error('eas.json not found');
    
    if (options.fix) {
      log.info('Attempting to initialize EAS...');
      runCommand('npx eas-cli init');
    }
    
    return false;
  }
  
  try {
    const easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    let isValid = true;
    
    // Check build profiles
    if (!easConfig.build) {
      log.error('No build configuration found in eas.json');
      isValid = false;
    } else {
      const requiredProfiles = ['development', 'preview', 'production'];
      for (const profile of requiredProfiles) {
        if (easConfig.build[profile]) {
          log.success(`Build profile '${profile}' exists`);
        } else {
          log.error(`Build profile '${profile}' is missing`);
          isValid = false;
        }
      }
    }
    
    // Check submit configuration
    if (!easConfig.submit || !easConfig.submit.production) {
      log.warning('Submit configuration for production not found in eas.json');
      
      if (options.fix) {
        log.info('Adding submit configuration...');
        if (!easConfig.submit) easConfig.submit = {};
        easConfig.submit.production = {
          android: {
            track: 'production'
          },
          ios: {
            appleId: 'YOUR_APPLE_ID',
            ascAppId: 'YOUR_ASC_APP_ID'
          }
        };
        fs.writeFileSync(easJsonPath, JSON.stringify(easConfig, null, 2));
        log.info('Added submit configuration template. Please update with your actual values.');
      }
    } else {
      log.success('Submit configuration for production exists');
    }
    
    // Check for update configuration
    if (!easConfig.updates) {
      log.warning('No update configuration found in eas.json');
      
      if (options.fix) {
        log.info('Adding update configuration...');
        easConfig.updates = {
          url: 'https://u.expo.dev/your-project-id'
        };
        fs.writeFileSync(easJsonPath, JSON.stringify(easConfig, null, 2));
        log.info('Added update configuration template. Please update with your actual project ID.');
      }
    } else {
      log.success('Update configuration exists');
    }
    
    return isValid;
  } catch (error) {
    log.error(`Error parsing eas.json: ${error.message}`);
    return false;
  }
}

// Check for GitHub environment variables
function checkEnvVars() {
  log.title('Checking Environment Variables');
  
  // For local environment, we can't really check GitHub secrets
  // But we can check if the user has an EXPO_TOKEN in their environment
  if (process.env.EXPO_TOKEN) {
    log.success('EXPO_TOKEN is set in environment');
  } else {
    log.warning('EXPO_TOKEN is not set in your local environment');
    log.info('For CI to work, you need to add this secret to GitHub repository settings');
    log.info('Get a token from https://expo.dev/accounts/[account]/settings/access-tokens');
  }
  
  // Check if there's a .env file with potential tokens
  if (checkFileExists('.env')) {
    log.warning('.env file exists, make sure it does not contain secrets that should be in GitHub secrets');
  }
  
  return true; // This is just informative
}

// Check TypeScript and Lint configuration
function checkTypeScriptAndLint() {
  log.title('Checking TypeScript and Lint Configuration');
  
  let isValid = true;
  
  // Check TypeScript config
  if (checkFileExists('tsconfig.json')) {
    log.success('tsconfig.json exists');
    
    // Optionally run TypeScript check if full check is requested
    if (options.fullCheck) {
      log.info('Running TypeScript check...');
      const tscResult = runCommand('npx tsc --noEmit', true);
      if (tscResult !== null) {
        log.success('TypeScript check passed');
      } else {
        log.error('TypeScript check failed');
        isValid = false;
      }
    }
  } else {
    log.error('tsconfig.json is missing');
    isValid = false;
    
    if (options.fix) {
      log.info('Creating basic tsconfig.json...');
      const tsconfig = {
        extends: 'expo/tsconfig.base',
        compilerOptions: {
          strict: true,
          baseUrl: '.',
          paths: {
            '@/*': ['src/*']
          }
        },
        include: ['src', 'App.tsx']
      };
      fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
      log.success('Created tsconfig.json');
    }
  }
  
  // Check ESLint config
  if (checkFileExists('.eslintrc.js') || checkFileExists('.eslintrc.json')) {
    log.success('ESLint configuration exists');
    
    // Optionally run ESLint if full check is requested
    if (options.fullCheck) {
      log.info('Running ESLint check...');
      const lintResult = runCommand('npx eslint src --max-warnings=0', true);
      if (lintResult !== null) {
        log.success('ESLint check passed');
      } else {
        log.error('ESLint check failed');
        isValid = false;
      }
    }
  } else {
    log.error('ESLint configuration is missing');
    isValid = false;
    
    if (options.fix) {
      log.info('Creating basic .eslintrc.js...');
      const eslintConfig = `module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    // Add custom rules here
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};`;
      fs.writeFileSync('.eslintrc.js', eslintConfig);
      log.success('Created .eslintrc.js');
    }
  }
  
  return isValid;
}

// Check test and lint commands
function checkTestAndLintCommands() {
  log.title('Checking Test and Lint Commands');
  
  if (!options.fullCheck) {
    log.info('Skipping test and lint command execution (use --full to include)');
    return true;
  }
  
  let isValid = true;
  
  // Check if tests run
  log.info('Running tests...');
  const testResult = runCommand('npm test -- --silent', true);
  if (testResult !== null) {
    log.success('Tests ran successfully');
  } else {
    log.error('Tests failed');
    isValid = false;
  }
  
  // Check if lint runs
  log.info('Running lint...');
  const lintResult = runCommand('npm run lint -- --quiet', true);
  if (lintResult !== null) {
    log.success('Lint ran successfully');
  } else {
    log.error('Lint failed');
    isValid = false;
  }
  
  return isValid;
}

// Check app.json configuration
function checkAppJson() {
  log.title('Checking app.json Configuration');
  
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (!fs.existsSync(appJsonPath)) {
    log.error('app.json not found');
    return false;
  }
  
  try {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    let isValid = true;
    
    // Check for essential app.json fields
    if (!appConfig.expo) {
      log.error('No expo configuration found in app.json');
      isValid = false;
    } else {
      // Check name
      if (!appConfig.expo.name) {
        log.error('app.json missing "name" field');
        isValid = false;
      } else {
        log.success(`App name: ${appConfig.expo.name}`);
      }
      
      // Check slug
      if (!appConfig.expo.slug) {
        log.error('app.json missing "slug" field');
        isValid = false;
      } else {
        log.success(`App slug: ${appConfig.expo.slug}`);
      }
      
      // Check version
      if (!appConfig.expo.version) {
        log.error('app.json missing "version" field');
        isValid = false;
      } else {
        log.success(`App version: ${appConfig.expo.version}`);
      }
      
      // Check updates configuration
      if (!appConfig.expo.updates) {
        log.warning('app.json missing "updates" configuration for OTA updates');
        
        if (options.fix) {
          log.info('Adding updates configuration...');
          appConfig.expo.updates = {
            enabled: true,
            fallbackToCacheTimeout: 0,
            url: 'https://u.expo.dev/your-project-id'
          };
          fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
          log.info('Added updates configuration template. Please update with your actual project ID.');
        }
      } else {
        log.success('Updates configuration exists');
      }
      
      // Check for Android and iOS specific configuration
      if (!appConfig.expo.android) {
        log.warning('No Android-specific configuration found');
      } else {
        log.success('Android configuration exists');
      }
      
      if (!appConfig.expo.ios) {
        log.warning('No iOS-specific configuration found');
      } else {
        log.success('iOS configuration exists');
      }
    }
    
    return isValid;
  } catch (error) {
    log.error(`Error parsing app.json: ${error.message}`);
    return false;
  }
}

// Check for CI GitHub workflow
function checkCIWorkflow() {
  log.title('Checking CI Workflow Configuration');
  
  const workflowPath = path.join(process.cwd(), '.github/workflows/ecocart-pipeline.yml');
  if (!fs.existsSync(workflowPath)) {
    log.error('CI workflow file not found at .github/workflows/ecocart-pipeline.yml');
    return false;
  }
  
  try {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    let isValid = true;
    
    // Check for essential jobs
    const essentialJobs = ['validate', 'development-build', 'preview-build', 'publish-update'];
    for (const job of essentialJobs) {
      if (!workflowContent.includes(`  ${job}:`)) {
        log.error(`CI workflow missing "${job}" job`);
        isValid = false;
      } else {
        log.success(`CI workflow includes "${job}" job`);
      }
    }
    
    return isValid;
  } catch (error) {
    log.error(`Error reading CI workflow file: ${error.message}`);
    return false;
  }
}

// Run all checks
function runAllChecks() {
  log.title('EcoCart CI Local Environment Check');
  
  // For EAS-only mode, only check EAS configuration
  if (options.easOnly) {
    const easValid = checkEasConfig();
    checkAppJson();
    
    const conclusion = easValid
      ? 'EAS configuration check completed successfully'
      : 'EAS configuration check failed. Please fix the issues above.';
    
    log.title(conclusion);
    process.exit(easValid ? 0 : 1);
    return;
  }
  
  const results = {
    files: checkRequiredFiles(),
    scripts: checkRequiredScripts(),
    dependencies: checkRequiredDependencies(),
    eas: checkEasConfig(),
    envVars: checkEnvVars(),
    tsAndLint: checkTypeScriptAndLint(),
    appJson: checkAppJson(),
    ciWorkflow: checkCIWorkflow()
  };
  
  // Only run tests if everything else passes and full check is requested
  if (options.fullCheck && Object.values(results).every(r => r)) {
    results.testAndLint = checkTestAndLintCommands();
  }
  
  // Print summary
  log.title('CI Environment Check Summary');
  
  for (const [check, result] of Object.entries(results)) {
    if (result) {
      log.success(`${check}: Passed`);
    } else {
      log.error(`${check}: Failed`);
    }
  }
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log.title('All checks passed! Your environment is ready for CI.');
    process.exit(0);
  } else {
    log.title('Some checks failed. Please fix the issues above before pushing to GitHub.');
    process.exit(1);
  }
}

// Run the check
runAllChecks(); 