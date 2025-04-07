# Testing Documentation for EcoCart App

## Overview

This documentation outlines the testing approach, structure, and guidelines for the EcoCart application. The testing strategy ensures that all components work correctly, edge cases are handled appropriately, and the application remains stable during development.

## Test Structure

Tests are organized in the `__tests__` directory, which mirrors the structure of the `src` directory:

```
__tests__/
├── components/           # UI component tests
│   ├── ar/              # AR-related component tests
│   └── smart-home/      # Smart home component tests
├── services/            # Service tests
│   ├── smart-home/      # Smart home service tests
│   │   ├── adapters/    # Adapter tests
│   │   ├── protocols/   # Protocol tests
│   │   └── repositories/ # Repository tests
│   └── MaterialsContributionService.test.ts
└── utils/              # Utility function tests
```

## Test Types

The project uses several types of tests:

### Unit Tests

Unit tests verify that individual functions, methods, or components work correctly in isolation. These tests use mocks for all dependencies.

Example:
```typescript
// Testing a service method
describe('MaterialsContributionService', () => {
  it('should validate required fields', async () => {
    const service = new MaterialsContributionService();
    const result = await service.submitContribution({ 
      imageData: '', 
      materialType: 'plastic', 
      containerType: ''
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly. These tests may use real implementations of some dependencies while mocking others.

Example:
```typescript
// Testing integration between component and service
describe('ContainerContributionForm integration', () => {
  it('should submit form data to the service', async () => {
    // Setup
    const mockSubmit = jest.fn().mockResolvedValue({ success: true, id: '123' });
    MockMaterialsContributionService.prototype.submitContribution = mockSubmit;
    
    // Render component
    const { getByTestId } = render(<ContainerContributionForm />);
    
    // Interact with component
    fireEvent.press(getByTestId('submit-button'));
    
    // Verify integration
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
```

### Snapshot Tests

Snapshot tests capture the rendered output of UI components and compare it to a stored baseline to detect unexpected changes.

Example:
```typescript
// Snapshot test for a component
it('should match snapshot', () => {
  const { toJSON } = render(<ARContainerScanner navigation={mockNavigation} />);
  expect(toJSON()).toMatchSnapshot();
});
```

### End-to-End Tests

End-to-end tests verify complete user flows through the application. These tests simulate real user interactions and verify the expected outcome.

## Tools and Libraries

- **Jest**: The primary testing framework
- **React Native Testing Library**: For testing React Native components
- **React Test Renderer**: For creating and testing React component output
- **Mock Service Worker**: For mocking API requests
- **Jest Mock**: For mocking modules and functions

## Mocking Approaches

### API Mocks

API calls are mocked to prevent actual network requests during testing. This is done using jest's mocking capabilities:

```typescript
// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 'mock-id' })
  })
);
```

### Storage Mocks

AsyncStorage is mocked to prevent actual storage operations:

```typescript
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve())
}));
```

### Hardware Mocks

Hardware features like BLE, camera, and sensors are mocked:

```typescript
// Mock BLE
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    state: jest.fn().mockResolvedValue('PoweredOn'),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn()
  }))
}));

// Mock Camera
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: { back: 'back', front: 'front' }
    },
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' })
  }
}));
```

## Test Coverage

The project aims for high test coverage across all critical components:

- **Services**: 90%+ coverage
- **Components**: 80%+ coverage
- **Utilities**: 90%+ coverage

Coverage reports are generated using Jest's coverage reporting.

## AR Container Recognition Tests

The AR container recognition feature is tested with these approaches:

1. **Camera Permission Handling**: Tests verify that the app handles camera permissions correctly.
2. **Recognition Flow**: Tests verify the container recognition workflow.
3. **UI States**: Tests verify that different UI states are displayed correctly.
4. **Contribution Process**: Tests verify that recognized containers can be contributed.

## Smart Home Integration Tests

The smart home integration is tested with these approaches:

1. **Device Discovery**: Tests verify that device discovery works correctly.
2. **Connection Management**: Tests verify connecting to and disconnecting from devices.
3. **Data Retrieval**: Tests verify reading data from connected devices.
4. **Event Handling**: Tests verify proper event emission and handling.
5. **Voice Platform Integration**: Tests verify integration with voice assistants.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm test -- --coverage
```

To run a specific test file:

```bash
npm test -- path/to/test.js
```

To update snapshots:

```bash
npm test -- -u
```

## Testing Guidelines

1. **Test Isolation**: Each test should be independent and not rely on other tests.
2. **Mock External Dependencies**: External systems should be mocked.
3. **Test Edge Cases**: Include tests for error conditions and edge cases.
4. **Keep Tests Fast**: Tests should execute quickly to encourage frequent running.
5. **Descriptive Test Names**: Use descriptive test names that explain what the test is verifying.

## Status and Future Work

Current test coverage focuses on core services and components. Future work includes:

1. Expanding end-to-end test coverage for critical user flows
2. Adding more integration tests for component interactions
3. Implementing visual regression testing
4. Setting up continuous integration for automated test runs

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing](https://docs.expo.dev/guides/testing/)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices) 