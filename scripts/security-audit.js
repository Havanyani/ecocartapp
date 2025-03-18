#!/usr/bin/env node

/**
 * EcoCart Security Audit Script
 * 
 * This script performs a comprehensive security audit of the EcoCart app,
 * including dependency vulnerability scanning, code analysis, and secure
 * storage checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SEVERITY_THRESHOLD = 'moderate'; // 'low', 'moderate', 'high', 'critical'
const SCAN_DIRECTORIES = ['src'];
const EXCLUDED_PATTERNS = ['node_modules', 'build', 'dist', '.git'];

// Security checks
const securityChecks = {
  dependencyVulnerabilities: {
    title: 'Dependency Vulnerabilities',
    run: () => {
      console.log(chalk.blue('Scanning dependencies for vulnerabilities...'));
      try {
        const output = execSync('npm audit --json').toString();
        const auditResult = JSON.parse(output);
        
        const vulnerabilities = {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
        };
        
        // Count vulnerabilities by severity
        if (auditResult.vulnerabilities) {
          Object.values(auditResult.vulnerabilities).forEach(vuln => {
            vulnerabilities[vuln.severity]++;
          });
        }
        
        // Determine if the audit passes based on threshold
        const severityLevels = ['info', 'low', 'moderate', 'high', 'critical'];
        const thresholdIndex = severityLevels.indexOf(SEVERITY_THRESHOLD);
        
        let fails = false;
        for (let i = thresholdIndex; i < severityLevels.length; i++) {
          if (vulnerabilities[severityLevels[i]] > 0) {
            fails = true;
            break;
          }
        }
        
        return {
          pass: !fails,
          details: vulnerabilities,
          message: fails 
            ? `Found vulnerabilities at or above ${SEVERITY_THRESHOLD} severity`
            : 'No vulnerabilities found above threshold',
        };
      } catch (error) {
        return {
          pass: false,
          details: error.message,
          message: 'Error running npm audit',
        };
      }
    },
  },
  
  sensitiveDataExposure: {
    title: 'Sensitive Data Exposure',
    run: () => {
      console.log(chalk.blue('Checking for sensitive data exposure...'));
      
      // Patterns to search for
      const patterns = [
        { regex: /const\s+(\w+)\s*=\s*['"]([^'"]*(?:password|secret|key|token|auth)[^'"]*)['"]/, name: 'Hardcoded credentials' },
        { regex: /console\.log\(.*?(password|token|secret|key).*?\)/, name: 'Logging sensitive data' },
        { regex: /AsyncStorage\.setItem\(['"].*?(password|token|secret|key)/, name: 'Insecure storage' },
      ];
      
      const findings = [];
      
      // Recursively scan directories
      function scanDir(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          
          // Skip excluded patterns
          if (EXCLUDED_PATTERNS.some(pattern => fullPath.includes(pattern))) {
            continue;
          }
          
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            scanDir(fullPath);
          } else if (stats.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
            // Read file content
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for patterns
            for (const pattern of patterns) {
              const matches = content.match(new RegExp(pattern.regex, 'g'));
              if (matches) {
                findings.push({
                  file: fullPath,
                  type: pattern.name,
                  matches: matches.length,
                });
              }
            }
          }
        }
      }
      
      // Start scanning
      for (const dir of SCAN_DIRECTORIES) {
        scanDir(dir);
      }
      
      return {
        pass: findings.length === 0,
        details: findings,
        message: findings.length === 0 
          ? 'No sensitive data exposure found'
          : `Found ${findings.length} instances of potential sensitive data exposure`,
      };
    },
  },
  
  secureStorageUsage: {
    title: 'Secure Storage Usage',
    run: () => {
      console.log(chalk.blue('Checking secure storage usage...'));
      
      // Patterns to search for
      const secureStoragePattern = /SecureStore\.(set|get)Item/;
      const asyncStoragePattern = /AsyncStorage\.(set|get)Item\(['"].*?(password|token|secret|key)/;
      
      const findings = {
        secureStorage: 0,
        insecureStorage: 0,
        files: [],
      };
      
      // Recursively scan directories
      function scanDir(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          
          // Skip excluded patterns
          if (EXCLUDED_PATTERNS.some(pattern => fullPath.includes(pattern))) {
            continue;
          }
          
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            scanDir(fullPath);
          } else if (stats.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
            // Read file content
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for secure storage
            const secureMatches = content.match(new RegExp(secureStoragePattern, 'g'));
            if (secureMatches) {
              findings.secureStorage += secureMatches.length;
            }
            
            // Check for insecure storage of sensitive data
            const insecureMatches = content.match(new RegExp(asyncStoragePattern, 'g'));
            if (insecureMatches) {
              findings.insecureStorage += insecureMatches.length;
              findings.files.push({
                file: fullPath,
                matches: insecureMatches.length,
              });
            }
          }
        }
      }
      
      // Start scanning
      for (const dir of SCAN_DIRECTORIES) {
        scanDir(dir);
      }
      
      return {
        pass: findings.insecureStorage === 0,
        details: findings,
        message: findings.insecureStorage === 0 
          ? 'No insecure storage of sensitive data found'
          : `Found ${findings.insecureStorage} instances of insecure storage of sensitive data`,
      };
    },
  },
  
  authenticationChecks: {
    title: 'Authentication Security',
    run: () => {
      console.log(chalk.blue('Checking authentication security...'));
      
      // Patterns to search for
      const patterns = [
        { regex: /password\.length\s*[<>]=?\s*(\d+)/, name: 'Password length validation' },
        { regex: /token.*?expires|expiresIn|expiresAt/, name: 'Token expiration handling' },
        { regex: /refresh.*?token/, name: 'Token refresh mechanism' },
      ];
      
      const findings = {
        passwordValidation: false,
        tokenExpiration: false,
        tokenRefresh: false,
      };
      
      // Recursively scan directories
      function scanDir(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          
          // Skip excluded patterns
          if (EXCLUDED_PATTERNS.some(pattern => fullPath.includes(pattern))) {
            continue;
          }
          
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            scanDir(fullPath);
          } else if (stats.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
            // Read file content
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for patterns
            if (content.match(patterns[0].regex)) {
              findings.passwordValidation = true;
            }
            
            if (content.match(patterns[1].regex)) {
              findings.tokenExpiration = true;
            }
            
            if (content.match(patterns[2].regex)) {
              findings.tokenRefresh = true;
            }
          }
        }
      }
      
      // Start scanning
      for (const dir of SCAN_DIRECTORIES) {
        scanDir(dir);
      }
      
      const missingChecks = Object.entries(findings)
        .filter(([_, implemented]) => !implemented)
        .map(([check]) => check);
      
      return {
        pass: missingChecks.length === 0,
        details: findings,
        message: missingChecks.length === 0 
          ? 'All authentication security checks passed'
          : `Missing authentication security checks: ${missingChecks.join(', ')}`,
      };
    },
  },
};

// Run all security checks
async function runSecurityAudit() {
  console.log(chalk.green.bold('Starting EcoCart Security Audit'));
  console.log(chalk.green('=============================='));
  
  const results = {};
  let overallPass = true;
  
  for (const [id, check] of Object.entries(securityChecks)) {
    console.log(chalk.yellow(`\n[${check.title}]`));
    
    const result = check.run();
    results[id] = result;
    
    if (!result.pass) {
      overallPass = false;
    }
    
    console.log(
      result.pass 
        ? chalk.green(`✓ PASS: ${result.message}`) 
        : chalk.red(`✗ FAIL: ${result.message}`)
    );
    
    if (result.details) {
      console.log(chalk.gray('Details:'), result.details);
    }
  }
  
  console.log(chalk.green('\n=============================='));
  console.log(
    overallPass 
      ? chalk.green.bold('✓ Security Audit Passed') 
      : chalk.red.bold('✗ Security Audit Failed')
  );
  
  return {
    pass: overallPass,
    results,
  };
}

// Run the audit
runSecurityAudit().catch(error => {
  console.error(chalk.red('Error running security audit:'), error);
  process.exit(1);
}); 