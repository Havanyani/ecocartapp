import { ThemeContext } from '@contexts/ThemeContext';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  const mockTheme = {
    text: {
      primary: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111111'
      },
      secondary: {
        fontSize: 12,
        fontWeight: '300',
        color: '#999999'
      }
    }
  };

  it('returns default theme when no provider exists', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.text.primary).toBeDefined();
    expect(result.current.text.secondary).toBeDefined();
  });

  it('returns theme from context when provider exists', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeContext.Provider value={mockTheme}>
        {children}
      </ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current).toEqual(mockTheme);
  });
}); 