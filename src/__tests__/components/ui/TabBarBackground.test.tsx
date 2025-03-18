import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { TabBarBackground } from '../../../components/ui/TabBarBackground';
import { useTheme } from '../../../hooks/useTheme';

// Mock dependencies
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

// Mock Platform.select
const originalSelect = Platform.select;
jest.spyOn(Platform, 'select').mockImplementation((config: any) => {
  if (config?.ios) return config.ios;
  if (config?.android) return config.android;
  return undefined;
});

describe('TabBarBackground', () => {
  const mockTheme = {
    colors: {
      background: '#ffffff',
      card: '#f5f5f5',
      border: '#e0e0e0'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  afterAll(() => {
    Platform.select = originalSelect;
  });

  it('renders with default styles', () => {
    const { getByTestId } = render(<TabBarBackground />);

    const background = getByTestId('tab-bar-background');
    expect(background).toHaveStyle({
      backgroundColor: mockTheme.colors.card,
      borderTopWidth: 1,
      borderTopColor: mockTheme.colors.border
    });
  });

  it('applies iOS specific styles', () => {
    Platform.select = jest.fn(config => config?.ios);
    
    const { getByTestId } = render(<TabBarBackground />);

    const background = getByTestId('tab-bar-background');
    expect(background).toHaveStyle({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 3
    });
  });

  it('applies Android specific styles', () => {
    Platform.select = jest.fn(config => config?.android);
    
    const { getByTestId } = render(<TabBarBackground />);

    const background = getByTestId('tab-bar-background');
    expect(background).toHaveStyle({
      elevation: 8
    });
  });

  it('handles custom style prop', () => {
    const customStyle = {
      backgroundColor: '#000000',
      borderTopWidth: 2
    };

    const { getByTestId } = render(
      <TabBarBackground style={customStyle} />
    );

    const background = getByTestId('tab-bar-background');
    expect(background).toHaveStyle(customStyle);
  });

  it('merges custom styles with default styles', () => {
    const customStyle = {
      backgroundColor: '#000000'
    };

    const { getByTestId } = render(
      <TabBarBackground style={customStyle} />
    );

    const background = getByTestId('tab-bar-background');
    expect(background).toHaveStyle({
      backgroundColor: '#000000',
      borderTopWidth: 1,
      borderTopColor: mockTheme.colors.border
    });
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <TabBarBackground>
        <div>Test Content</div>
      </TabBarBackground>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
}); 