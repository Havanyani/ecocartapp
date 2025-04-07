import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';

// Mock theme hook
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn()
}));

type FontWeight = TextStyle['fontWeight'];

type TextVariant = {
  color: string;
  fontSize: number;
  fontWeight: FontWeight;
};

// Mock theme values with proper style objects
const mockTheme = {
  theme: {
    colors: {
      text: {
        primary: {
          color: '#000000',
          fontSize: 16,
          fontWeight: '600' as FontWeight
        } satisfies TextVariant,
        secondary: {
          color: '#666666',
          fontSize: 14,
          fontWeight: '400' as FontWeight
        } satisfies TextVariant
      }
    }
  },
  isDark: false,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
  themeTransition: { interpolate: jest.fn() }
};

describe('ThemedText', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders text with default theme style', () => {
    const { getByText } = render(
      <ThemedText>Hello World</ThemedText>
    );
    
    const text = getByText('Hello World');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(mockTheme.theme.colors.text)
      ])
    );
  });

  it('applies secondary variant', () => {
    const { getByText } = render(
      <ThemedText variant="secondary">Secondary Text</ThemedText>
    );
    
    const text = getByText('Secondary Text');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(mockTheme.theme.colors.textSecondary)
      ])
    );
  });

  it('applies custom styles over theme', () => {
    const customStyle: TextStyle = {
      fontSize: 20,
      fontWeight: '700',
      color: '#2e7d32'
    };

    const { getByText } = render(
      <ThemedText style={customStyle}>Custom Text</ThemedText>
    );
    
    const text = getByText('Custom Text');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('handles testID prop', () => {
    const { getByTestId } = render(
      <ThemedText testID="test-text">Test Text</ThemedText>
    );
    
    expect(getByTestId('test-text')).toBeTruthy();
  });

  it('applies accessibility props', () => {
    const { getByRole } = render(
      <ThemedText 
        accessibilityLabel="Accessible text"
        accessibilityRole="header"
      >
        Accessible
      </ThemedText>
    );
    
    expect(getByRole('header', { name: 'Accessible text' })).toBeTruthy();
  });

  it('passes style props correctly', () => {
    const style = { fontSize: 16, color: 'red' };
    const { getByText } = render(
      <ThemedText style={style}>Styled Text</ThemedText>
    );
    const textElement = getByText('Styled Text');
    expect(textElement.props.style).toEqual(style);
  });

  it('supports accessibility props', () => {
    const { getByTestId } = render(
      <ThemedText
        testID="themed-text"
        accessible={true}
        accessibilityLabel="Test text"
        accessibilityRole="header"
      >
        Accessible Text
      </ThemedText>
    );
    
    const textElement = getByTestId('themed-text');
    expect(textElement.props.accessible).toBe(true);
    expect(textElement.props.accessibilityLabel).toBe('Test text');
    expect(textElement.props.accessibilityRole).toBe('header');
  });

  it('applies theme styles correctly', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text" variant="primary">
        Test Text
      </ThemedText>
    );

    const textElement = getByTestId('themed-text');
    const flattenedStyle = StyleSheet.flatten(textElement.props.style);
    
    const expectedStyle = {
      fontSize: mockTheme.theme.colors.text.fontSize,
      fontWeight: mockTheme.theme.colors.text.fontWeight,
      color: mockTheme.theme.colors.text.color
    } satisfies TextStyle;
    
    expect(flattenedStyle).toMatchObject(expectedStyle);
  });

  it('merges custom styles with theme styles', () => {
    const customStyle = {
      marginTop: 10,
      color: 'red',
      fontWeight: '700' as FontWeight
    } satisfies TextStyle;

    const { getByTestId } = render(
      <ThemedText 
        testID="themed-text"
        variant="primary"
        style={customStyle}
      >
        Test Text
      </ThemedText>
    );

    const textElement = getByTestId('themed-text');
    const flattenedStyle = StyleSheet.flatten(textElement.props.style);

    const expectedStyle = {
      fontSize: mockTheme.theme.colors.text.fontSize,
      fontWeight: '700' as FontWeight,
      marginTop: 10,
      color: 'red'
    } satisfies TextStyle;

    expect(flattenedStyle).toMatchObject(expectedStyle);
  });

  it('applies secondary variant styles', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text" variant="secondary">
        Test Text
      </ThemedText>
    );

    const textElement = getByTestId('themed-text');
    const flattenedStyle = StyleSheet.flatten(textElement.props.style);

    expect(flattenedStyle).toMatchObject(mockTheme.theme.colors.textSecondary);
  });

  it('handles style arrays', () => {
    const additionalStyles = [
      { marginTop: 5 },
      { paddingLeft: 10 }
    ];

    const { getByTestId } = render(
      <ThemedText 
        testID="themed-text"
        variant="primary"
        style={additionalStyles}
      >
        Test Text
      </ThemedText>
    );

    const textElement = getByTestId('themed-text');
    const flattenedStyle = StyleSheet.flatten(textElement.props.style);

    expect(flattenedStyle).toMatchObject({
      ...mockTheme.theme.colors.text,
      marginTop: 5,
      paddingLeft: 10
    });
  });

  it('handles undefined style prop', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text" variant="primary">
        Test Text
      </ThemedText>
    );

    const textElement = getByTestId('themed-text');
    const flattenedStyle = StyleSheet.flatten(textElement.props.style);

    expect(flattenedStyle).toMatchObject(mockTheme.theme.colors.text);
  });
}); 