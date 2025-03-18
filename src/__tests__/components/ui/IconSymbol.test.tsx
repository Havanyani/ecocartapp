import { render } from '@testing-library/react-native';
import React from 'react';
import { IconSymbol } from '../../../components/ui/IconSymbol';
import { useTheme } from '../../../hooks/useTheme';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

describe('IconSymbol', () => {
  const mockTheme = {
    colors: {
      primary: '#2e7d32',
      text: '#000000',
      icon: '#757575'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders icon with default props', () => {
    const { getByTestId } = render(
      <IconSymbol name="recycle" />
    );

    const icon = getByTestId('icon-symbol');
    expect(icon.props.name).toBe('recycle');
    expect(icon.props.size).toBe(24); // Default size
    expect(icon.props.color).toBe(mockTheme.colors.icon); // Default color
  });

  it('applies custom size and color', () => {
    const { getByTestId } = render(
      <IconSymbol 
        name="recycle"
        size={32}
        color="#ff0000"
      />
    );

    const icon = getByTestId('icon-symbol');
    expect(icon.props.size).toBe(32);
    expect(icon.props.color).toBe('#ff0000');
  });

  it('handles style prop', () => {
    const customStyle = {
      marginRight: 8,
      opacity: 0.8
    };

    const { getByTestId } = render(
      <IconSymbol 
        name="recycle"
        style={customStyle}
      />
    );

    const icon = getByTestId('icon-symbol');
    expect(icon).toHaveStyle(customStyle);
  });

  it('provides accessible icon', () => {
    const { getByRole } = render(
      <IconSymbol 
        name="recycle"
        accessibilityLabel="Recycle icon"
      />
    );

    const icon = getByRole('image');
    expect(icon.props.accessibilityLabel).toBe('Recycle icon');
  });

  it('uses theme color when no color prop provided', () => {
    const { getByTestId } = render(
      <IconSymbol name="recycle" />
    );

    const icon = getByTestId('icon-symbol');
    expect(icon.props.color).toBe(mockTheme.colors.icon);
  });

  it('handles undefined style prop', () => {
    const { getByTestId } = render(
      <IconSymbol name="recycle" style={undefined} />
    );

    const icon = getByTestId('icon-symbol');
    expect(icon).toBeTruthy(); // Should render without errors
  });
}); 