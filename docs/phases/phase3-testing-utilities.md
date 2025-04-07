# Phase 3: Testing Utilities

## Overview

This document outlines the testing utilities and tools available for the EcoCart application during Phase 3 of development. These utilities support various testing activities and help ensure application quality across platforms.

## Testing Frameworks

### 1. Jest

- **Purpose**: Unit and component testing
- **Configuration**: `jest.config.js`
- **Key Features**:
  - Snapshot testing
  - Mock functions
  - Async testing
  - Coverage reporting

### 2. React Native Testing Library

- **Purpose**: Component testing
- **Configuration**: `setupTests.js`
- **Key Features**:
  - Component rendering
  - User interaction simulation
  - Accessibility testing
  - Query methods

### 3. Detox

- **Purpose**: End-to-end testing
- **Configuration**: `.detoxrc.js`
- **Key Features**:
  - Cross-platform testing
  - Real device testing
  - CI/CD integration
  - Automated workflows

## Testing Utilities

### 1. Mock Data Generators

```typescript
// src/testing/mocks/dataGenerators.ts
export const generateMockCollection = () => ({
  id: uuid(),
  status: 'scheduled',
  scheduledDate: new Date(),
  materials: generateMockMaterials(),
  address: generateMockAddress(),
  notes: 'Test collection notes'
});

export const generateMockMaterials = () => [
  {
    id: uuid(),
    name: 'Plastic',
    weight: 2.5,
    category: 'recyclable'
  }
];
```

### 2. Test Helpers

```typescript
// src/testing/helpers/testHelpers.ts
export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  return render(
    <ThemeProvider>
      <NavigationContainer>
        {ui}
      </NavigationContainer>
    </ThemeProvider>,
    options
  );
};

export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByTestId('loading-indicator')).toBeNull();
  });
```

### 3. Custom Matchers

```typescript
// src/testing/matchers/customMatchers.ts
expect.extend({
  toHaveStyle(received, style) {
    const pass = Object.entries(style).every(
      ([key, value]) => received.props.style[key] === value
    );
    return {
      pass,
      message: () =>
        `expected ${received} to${pass ? ' not' : ''} have style ${JSON.stringify(
          style
        )}`
    };
  }
});
```

## Performance Testing Tools

### 1. React Native Performance Monitor

- **Purpose**: Performance profiling
- **Features**:
  - Frame rate monitoring
  - Memory usage tracking
  - Render time analysis
  - Network request timing

### 2. Chrome DevTools

- **Purpose**: Web debugging
- **Features**:
  - Network inspection
  - Console logging
  - Performance profiling
  - Memory heap analysis

## Testing Scripts

### 1. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build",
    "test:performance": "node scripts/performance-test.js"
  }
}
```

### 2. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

## Testing Best Practices

### 1. Component Testing

- Test component rendering
- Test user interactions
- Test error states
- Test loading states
- Test accessibility

### 2. Integration Testing

- Test navigation flows
- Test data persistence
- Test API integration
- Test state management

### 3. Performance Testing

- Test render performance
- Test animation smoothness
- Test memory usage
- Test network efficiency

## Debugging Tools

### 1. React Native Debugger

- Network inspection
- Redux DevTools
- React DevTools
- Console logging

### 2. Flipper

- Network inspection
- Layout inspection
- Crash reporting
- Performance monitoring

## Test Data Management

### 1. Mock API Responses

```typescript
// src/testing/mocks/apiResponses.ts
export const mockCollectionResponse = {
  data: {
    id: '123',
    status: 'scheduled',
    materials: [
      {
        id: '456',
        name: 'Plastic',
        weight: 2.5
      }
    ]
  }
};
```

### 2. Test Database

- SQLite for local testing
- Mock data seeding
- Test data cleanup
- Transaction support

## Reporting Tools

### 1. Jest Coverage Reports

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### 2. Test Results Dashboard

- Test execution time
- Pass/fail rates
- Error summaries
- Performance metrics

## Maintenance

### 1. Regular Updates

- Framework updates
- Dependency updates
- Test maintenance
- Documentation updates

### 2. Quality Checks

- Code coverage
- Test quality
- Performance benchmarks
- Documentation completeness 