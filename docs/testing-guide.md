# EcoCart Testing Guide

This guide provides an overview of the testing infrastructure for the EcoCart application, including unit, integration, and end-to-end (E2E) testing.

## Testing Structure

EcoCart's testing strategy consists of several layers:

1. **Unit Tests**: Test individual components and functions in isolation
2. **Integration Tests**: Test interactions between components and services
3. **End-to-End Tests**: Test complete user flows from UI to backend

## Test Directory Structure

```
ecocartapp/
├── tests/
│   └── integration/             # Integration tests
│       ├── MaterialCollection.test.tsx
│       └── RealTimeFeatures.test.tsx
│
└── src/
    └── e2e/                     # End-to-end tests
        ├── config/
        │   └── setup.js         # E2E test configuration
        ├── tests/               # E2E test suites
        │   ├── authentication.e2e.ts
        │   ├── materialCollection.e2e.ts
        │   ├── profile.e2e.ts
        │   ├── smartHome.e2e.ts
        │   └── analytics.e2e.ts
        ├── firstTest.e2e.js
        ├── firstTest.e2e.ts
        └── jest.config.js       # Jest configuration for E2E tests
```

## Running Tests

### Unit and Integration Tests

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

Run all tests (unit + integration):
```bash
npm test
```

### End-to-End Tests

#### Setup for E2E Tests

For Android:
1. Ensure Android SDK is installed and configured
2. Create an Android Virtual Device (AVD) named "Pixel_4_API_30"
3. Install detox CLI: `npm install -g detox-cli`

For iOS:
1. Ensure Xcode is installed (macOS only)
2. Install applesimutils: `brew tap wix/brew && brew install applesimutils`
3. Install detox CLI: `npm install -g detox-cli`

#### Running E2E Tests

Build and run tests for Android:
```bash
npm run e2e:build:android
npm run e2e:test:android
```

Build and run tests for iOS (macOS only):
```bash
npm run e2e:build:ios
npm run e2e:test:ios
```

## Writing Tests

### Unit and Integration Tests

We use Jest and React Testing Library for unit and integration tests. Example:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MaterialItem } from '../components/MaterialItem';

describe('MaterialItem', () => {
  it('renders correctly with props', () => {
    const { getByText } = render(
      <MaterialItem name="Plastic Bottle" points={10} />
    );
    
    expect(getByText('Plastic Bottle')).toBeTruthy();
    expect(getByText('10 pts')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <MaterialItem 
        name="Plastic Bottle" 
        points={10} 
        onPress={onPressMock} 
        testID="material-item"
      />
    );
    
    fireEvent.press(getByTestId('material-item'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests with Detox

E2E tests use Detox to simulate real user interactions. Example:

```typescript
import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

### Naming Conventions

- Unit test files: `ComponentName.test.ts(x)`
- Integration test files: `FeatureName.test.ts(x)`
- E2E test files: `featureName.e2e.ts`

### Test IDs

Always use consistent testIDs for E2E testing:

- Screen containers: `screen-name-screen` (e.g., `profile-screen`)
- Buttons: `action-button` (e.g., `login-button`)
- Inputs: `field-input` (e.g., `email-input`)
- Lists: `list-name-list` (e.g., `material-list`)
- List items: `item-name-index` (e.g., `material-item-0`)

## Continuous Integration

Tests automatically run in GitHub Actions:

1. On push to `main` and `develop` branches
2. On pull requests to these branches

CI runs:
- Unit and integration tests on Ubuntu
- E2E tests on macOS for both Android and iOS

## Mocking

### Network Requests

Use [MSW (Mock Service Worker)](https://mswjs.io/) to mock API responses:

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/materials', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'Plastic Bottle', points: 10 },
        { id: 2, name: 'Aluminum Can', points: 15 }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Native Modules

Mock native modules using Jest mock functions:

```typescript
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      }
    }
  }
}));
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests
2. **Testing Behavior**: Focus on testing behavior rather than implementation details
3. **Coverage**: Aim for high coverage but prioritize critical paths
4. **Test Readability**: Write clear, descriptive test cases with meaningful assertions
5. **Mock External Services**: Always mock external dependencies like network calls
6. **Clean Up**: Ensure tests clean up after themselves
7. **Keep Tests Fast**: Optimize tests to run quickly
8. **Test Responsiveness**: Include tests for different screen sizes and orientations
9. **Accessibility Testing**: Test that all UI elements are accessible
10. **Security Testing**: Include tests for authentication and authorization

## Troubleshooting

### Common Issues

- **Detox Connection Issues**: Reset the simulator/emulator and rebuild the app
- **Jest Timeouts**: Increase timeout in Jest configuration
- **UI Element Not Found**: Check testID, text content, or accessibility label
- **Test Flakiness**: Add proper waits for async operations

For detailed error logs, check:
- `detox.log` for E2E test issues
- Console output for Jest test failures

## Updating Tests

When adding new features:
1. Add unit tests for new components and functions
2. Update integration tests for affected features
3. Add or update E2E tests for user flows

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [Detox Documentation](https://wix.github.io/Detox/)
