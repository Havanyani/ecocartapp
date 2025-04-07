# EcoCart CI/CD Pipeline Documentation

This document provides an overview of the CI/CD pipeline for the EcoCart mobile application. The pipeline is designed to automate testing, building, and deployment processes across different environments.

## Overview

The EcoCart CI/CD pipeline is implemented using GitHub Actions and is triggered on the following events:

- **Push** to `main`, `develop`, or `release/*` branches
- **Pull Request** to `main` or `develop` branches
- **Tags** matching the pattern `v*` (e.g., `v1.0.0`)
- **Manual trigger** through GitHub Actions interface

## Pipeline Stages

### 1. Validate Code

This stage performs basic code validation checks:

- TypeScript compilation check
- ESLint for code quality
- Duplicate dependency check
- Security vulnerability scan
- Unit tests with code coverage reporting

**Files**: 
- `.github/workflows/ecocart-pipeline.yml`
- `jest.config.js`
- `.eslintrc.js`

### 2. Dependency Review (PR Only)

For pull requests, this stage performs a security check on dependency changes:

- Scans for vulnerabilities in added or updated dependencies
- Fails if high-severity vulnerabilities are found

### 3. Code Quality Analysis

This stage performs in-depth code quality analysis:

- Static code analysis with SonarQube/SonarCloud
- Bundle size analysis
- Optional: Performance metrics

### 4. Development Build (PRs and develop branch)

Builds development versions of the app:

- Creates Expo development builds for all platforms
- Uses the EAS Build service with the `development` profile
- Includes development-specific configurations

**Configuration File**: `eas.json` (development profile)

### 5. Preview Build (PRs only)

Creates a preview build for testing purposes:

- Builds an Android preview APK
- Posts download link as a comment on the PR
- Allows reviewers to test the changes

**Configuration File**: `eas.json` (preview profile)

### 6. Publish OTA Update (main and release branches)

Publishes over-the-air updates:

- Triggered when code is pushed to main or release branches
- Creates an Expo update with the latest changes
- Publishes to the appropriate update channel (production or staging)
- Existing app installations will receive the update

**Configuration Files**: 
- `eas.json` (updates section)
- `app.json` (updates section)

### 7. Production Build (Tags only)

Creates production builds for app store submission:

- Triggered when a version tag is pushed (e.g., `v1.0.0`)
- Updates the app version in the configuration files
- Builds iOS and Android apps for production
- Submits builds to App Store Connect and Google Play Console

**Configuration Files**:
- `eas.json` (production profile)
- `app.json` (version field)

### 8. Create GitHub Release (Tags only)

Creates a GitHub release for each version:

- Generates release notes from changes
- Adds download links
- Includes a changelog of commits

## Environment Configuration

### Required Environment Variables

The pipeline requires the following secrets to be configured in the GitHub repository:

- `EXPO_TOKEN`: Access token for Expo services
- `SONAR_TOKEN`: (Optional) Token for SonarQube/SonarCloud analysis
- `SONAR_HOST_URL`: (Optional) URL for self-hosted SonarQube server

### Configuration Files

The pipeline relies on several configuration files:

1. **eas.json**: Defines build profiles and update configurations
2. **app.json**: Contains app metadata and configuration
3. **package.json**: Defines dependencies and scripts

## Local Development Integration

To ensure your changes pass CI before pushing, you can use the local CI check:

```bash
# Basic check
node scripts/ci-local-check.js

# Only check EAS configuration
node scripts/ci-local-check.js --eas-only

# Full check including running tests
node scripts/ci-local-check.js --full

# Attempt to fix common issues
node scripts/ci-local-check.js --fix
```

## Troubleshooting

### Common Pipeline Failures

1. **TypeScript or ESLint Failures**:
   - Run `npm run lint` and `npx tsc --noEmit` locally to find and fix issues

2. **Test Failures**:
   - Run `npm test` locally to debug failed tests
   - Check test coverage reports

3. **EAS Build Failures**:
   - Check EAS build logs for detailed error information
   - Verify your `eas.json` configuration
   - Ensure `app.json` is correctly configured

4. **OTA Update Failures**:
   - Verify your Expo token has sufficient permissions
   - Check that update configuration is set correctly in `app.json` and `eas.json`

### Viewing Logs and Reports

Pipeline logs and artifacts can be accessed:

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select the workflow run you want to examine
4. Review the logs for each job
5. Download any available artifacts

## Best Practices

1. **Keep the main branch always deployable**:
   - Never push breaking changes directly to main
   - Use feature branches and pull requests

2. **Write meaningful commit messages**:
   - Follow conventional commits format (e.g., `feat: add shopping cart`)
   - These messages are used in changelogs and release notes

3. **Maintain high test coverage**:
   - Write tests for new features and bug fixes
   - Aim for at least 70% code coverage

4. **Monitor bundle size**:
   - Keep an eye on the bundle size reports
   - Optimize imports and use code splitting where possible

5. **Version management**:
   - Use semantic versioning for tags (`v{major}.{minor}.{patch}`)
   - Increment version appropriately for each release

## Extending the Pipeline

To customize or extend the pipeline:

1. Edit `.github/workflows/ecocart-pipeline.yml`
2. Add new environment variables in GitHub repository settings
3. Create custom scripts in the `scripts/` directory
4. Update the documentation to reflect your changes

## Future Improvements

Planned improvements to the pipeline include:

1. **E2E Testing**: Adding end-to-end tests with Detox
2. **Performance Testing**: Automated performance benchmarking
3. **A/B Testing**: Integration with A/B testing frameworks
4. **Canary Releases**: Gradual rollout to detect issues early
5. **Automated Regression Testing**: Visual regression testing

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Updates Documentation](https://docs.expo.dev/eas-update/introduction/) 