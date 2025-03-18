# Documentation Automation

This document describes the automated tools and processes used to ensure documentation quality and consistency across the EcoCart project.

## Overview

Documentation automation helps maintain high-quality documentation by automatically checking for common issues, enforcing consistency, and streamlining the documentation workflow. The EcoCart project uses several tools to automate documentation quality checks.

## Automated Documentation Checks

### 1. Markdown Linting

We use `markdownlint` to enforce consistent formatting and structure in markdown files.

**Installation:**
```bash
npm install -g markdownlint-cli
```

**Usage:**
```bash
markdownlint ./docs/**/*.md
```

**Configuration:**
Our custom rules are defined in `.markdownlint.json` in the project root:
```json
{
  "default": true,
  "MD013": { "line_length": 120 },
  "MD033": false,
  "MD041": false
}
```

### 2. Link Checking

We use `markdown-link-check` to verify that all links in documentation are valid.

**Installation:**
```bash
npm install -g markdown-link-check
```

**Usage:**
```bash
find ./docs -name "*.md" -exec markdown-link-check {} \;
```

**Configuration:**
Configuration is stored in `.markdown-link-check.json`:
```json
{
  "ignorePatterns": [
    { "pattern": "^#" },
    { "pattern": "^mailto:" }
  ],
  "replacementPatterns": [
    { "pattern": "^/", "replacement": "https://github.com/ecocart/ecocartapp/blob/main/" }
  ]
}
```

### 3. Spelling Check

We use `cspell` to catch spelling errors in documentation.

**Installation:**
```bash
npm install -g cspell
```

**Usage:**
```bash
cspell "docs/**/*.md"
```

**Configuration:**
We maintain a custom dictionary in `.cspell.json` to include domain-specific terms:
```json
{
  "version": "0.2",
  "language": "en",
  "dictionaries": ["en_US", "companies", "softwareTerms", "typescript", "ecocart"],
  "dictionaryDefinitions": [
    { "name": "ecocart", "path": "./dictionaries/ecocart.txt" }
  ],
  "ignorePaths": [
    "node_modules/**",
    "dist/**"
  ]
}
```

### 4. Reading Level Analysis

We use `readability` to ensure documentation is written at an appropriate reading level.

**Installation:**
```bash
npm install -g readability-cli
```

**Usage:**
```bash
readability check docs/**/*.md --threshold=70
```

**Configuration:**
We target a Flesch Reading Ease score of at least 70 (fairly easy to read) for user documentation and 50 (fairly difficult) for technical documentation.

### 5. Code Example Validation

We use a custom script to extract and validate code examples from documentation.

**Usage:**
```bash
node ./scripts/validate-code-examples.js
```

This tool:
- Extracts code blocks with language annotations (e.g., ```tsx)
- Runs appropriate linters for each language
- For TypeScript/JavaScript, checks for syntax errors using a lightweight transpiler
- Reports issues with line numbers referring back to the original documentation

## CI Integration

These checks are integrated into our CI pipeline with the following configuration in `.github/workflows/documentation-checks.yml`:

```yaml
name: Documentation Checks

on:
  push:
    paths:
      - '**/*.md'
      - '.markdownlint.json'
      - '.cspell.json'
      - '.markdown-link-check.json'
  pull_request:
    paths:
      - '**/*.md'
      - '.markdownlint.json'
      - '.cspell.json'
      - '.markdown-link-check.json'

jobs:
  documentation-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install -g markdownlint-cli markdown-link-check cspell readability-cli
      
      - name: Markdown lint
        run: markdownlint ./docs/**/*.md
      
      - name: Check links
        run: find ./docs -name "*.md" -exec markdown-link-check {} \;
      
      - name: Check spelling
        run: cspell "docs/**/*.md"
      
      - name: Check readability
        run: readability check docs/**/*.md --threshold=50
      
      - name: Validate code examples
        run: node ./scripts/validate-code-examples.js
```

## Pre-Commit Hooks

We provide pre-commit hooks to run these checks before committing documentation changes:

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check only markdown files that are staged for commit
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.md$")

if [ -n "$FILES" ]; then
  echo "Running documentation checks..."
  
  # Run markdownlint on staged markdown files
  echo "$FILES" | xargs markdownlint || exit 1
  
  # Run link checker on staged markdown files
  for file in $FILES; do
    markdown-link-check "$file" || exit 1
  done
  
  # Run spell checker on staged markdown files
  echo "$FILES" | xargs cspell || exit 1
  
  # Check readability of user docs
  USER_DOCS=$(echo "$FILES" | grep "USER\|user\|guide")
  if [ -n "$USER_DOCS" ]; then
    echo "$USER_DOCS" | xargs readability check --threshold=70 || exit 1
  fi
  
  # Check readability of technical docs
  TECH_DOCS=$(echo "$FILES" | grep -v "USER\|user\|guide")
  if [ -n "$TECH_DOCS" ]; then
    echo "$TECH_DOCS" | xargs readability check --threshold=50 || exit 1
  fi
  
  # Validate code examples
  node ./scripts/validate-code-examples.js || exit 1
fi

exit 0
```

## Documentation Generation

### API Documentation Generation

We automatically generate API documentation from code comments using TypeDoc:

```bash
npx typedoc --out docs/api src/services/*.ts
```

### Component Documentation Generation

We use a custom script to extract component props and generate documentation stubs:

```bash
node ./scripts/generate-component-docs.js src/components/ui/Button.tsx
```

This generates a component README stub with:
- Component name and description
- Props table with types and default values
- Basic usage example

## Automation Dashboard

We provide a documentation automation dashboard at `/docs/automation-dashboard.html` which shows:

- Last run time for each automated check
- Pass/fail status
- Issues found
- Trend over time
- Documentation coverage metrics

## Implementing Documentation Automation

To set up documentation automation:

1. Install required dependencies:
   ```bash
   npm install -g markdownlint-cli markdown-link-check cspell readability-cli
   ```

2. Add configuration files to the project root:
   - `.markdownlint.json`
   - `.cspell.json`
   - `.markdown-link-check.json`

3. Install pre-commit hooks:
   ```bash
   cp ./scripts/pre-commit .git/hooks/
   chmod +x .git/hooks/pre-commit
   ```

4. Run all checks manually:
   ```bash
   npm run docs:check
   ```

## Extending Automation

The documentation automation system can be extended with:

1. **Custom checkers**: Add new checkers for specific requirements
2. **Integration with documentation platforms**: Auto-publish to internal wiki
3. **Notification system**: Alert documentation owners of issues
4. **Content suggestions**: Use ML to suggest improvements

## Related Documentation

- [Documentation Review Schedule](./documentation-review-schedule.md)
- [Documentation Maintenance Process](./documentation-maintenance-process.md)
- [Documentation Review Checklist](./documentation-review-checklist.md) 