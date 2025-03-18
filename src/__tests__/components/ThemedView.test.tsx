import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import ThemedView from '../../components/ThemedView';
import { useTheme } from '../../hooks/useTheme';

// Mock theme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

// Mock theme values
const mockTheme = {
  view: {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    container: {
      backgroundColor: '#F5F5F5',
      padding: 20,
      flex: 1
    }
  }
};

describe('ThemedView', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('applies theme styles correctly', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" variant="card">
        <></>
      </ThemedView>
    );

    const viewElement = getByTestId('themed-view');
    const flattenedStyle = StyleSheet.flatten(viewElement.props.style);
    
    expect(flattenedStyle).toMatchObject(mockTheme.view.card);
  });

  it('merges custom styles with theme styles', () => {
    const customStyle = {
      margin: 10,
      padding: 20
    };

    const { getByTestId } = render(
      <ThemedView 
        testID="themed-view"
        variant="card"
        style={customStyle}
      >
        <></>
      </ThemedView>
    );

    const viewElement = getByTestId('themed-view');
    const flattenedStyle = StyleSheet.flatten(viewElement.props.style);

    expect(flattenedStyle).toMatchObject({
      ...mockTheme.view.card,
      ...customStyle
    });
  });

  it('handles container variant', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" variant="container">
        <></>
      </ThemedView>
    );

    const viewElement = getByTestId('themed-view');
    const flattenedStyle = StyleSheet.flatten(viewElement.props.style);

    expect(flattenedStyle).toMatchObject(mockTheme.view.container);
  });

  it('supports accessibility props', () => {
    const { getByTestId } = render(
      <ThemedView
        testID="themed-view"
        accessible={true}
        accessibilityLabel="Container view"
        accessibilityRole="none"
      >
        <></>
      </ThemedView>
    );
    
    const viewElement = getByTestId('themed-view');
    expect(viewElement.props.accessible).toBe(true);
    expect(viewElement.props.accessibilityLabel).toBe('Container view');
    expect(viewElement.props.accessibilityRole).toBe('none');
  });

  it('handles style arrays', () => {
    const additionalStyles = [
      { marginTop: 5 },
      { paddingLeft: 10 }
    ];

    const { getByTestId } = render(
      <ThemedView 
        testID="themed-view"
        variant="card"
        style={additionalStyles}
      >
        <></>
      </ThemedView>
    );

    const viewElement = getByTestId('themed-view');
    const flattenedStyle = StyleSheet.flatten(viewElement.props.style);

    expect(flattenedStyle).toMatchObject({
      ...mockTheme.view.card,
      marginTop: 5,
      paddingLeft: 10
    });
  });
}); 