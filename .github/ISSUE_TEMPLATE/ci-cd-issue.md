---
name: CI/CD Pipeline Issue
about: Report an issue with the CI/CD pipeline
title: '[CI/CD] '
labels: ci-cd, infrastructure
assignees: ''
---

## CI/CD Issue Description

<!-- Please provide a clear and concise description of the issue you're experiencing with the CI/CD pipeline -->

## Pipeline Job

<!-- Which job in the pipeline is failing or having issues? -->
- [ ] Validate Code
- [ ] Dependency Review
- [ ] Code Quality Analysis
- [ ] Development Build
- [ ] Preview Build
- [ ] Publish OTA Update
- [ ] Production Build
- [ ] Create GitHub Release
- [ ] Other: <!-- specify -->

## Workflow Run

<!-- Please provide a link to the GitHub Actions workflow run that's failing -->
Workflow URL: 

## Error Message

<!-- Copy and paste the relevant error message(s) -->
```
PASTE ERROR MESSAGE HERE
```

## Branch/Tag Information

<!-- Provide information about the branch/tag where the issue occurred -->
- Branch/Tag name: 
- Commit hash:

## Local Reproduction

<!-- Can you reproduce this issue locally using the CI local check script? -->
- [ ] Yes, using `node scripts/ci-local-check.js`
- [ ] No, it only happens in the GitHub Actions environment

## Additional Context

<!-- Add any other context about the problem here, such as recent changes that might have caused this issue -->

## Possible Solution

<!-- If you have ideas on how to fix this issue, please share them here --> 