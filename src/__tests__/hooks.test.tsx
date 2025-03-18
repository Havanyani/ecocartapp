import { renderHook } from '@testing-library/react-hooks';
import { TIMING } from '../components/notifications/constants';
import { useAnimationPreset } from '../components/notifications/hooks/useAnimationPreset';
import { ALERT_PRESETS } from '../components/notifications/utils/animation-presets';

describe('Animation Hooks', () => {
  describe('useAnimationPreset', () => {
    it('should return correct preset without options', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN'
        })
      );

      expect(result.current).toEqual(ALERT_PRESETS.FADE_IN);
    });

    it('should merge custom options with preset', () => {
      const customOptions = {
        duration: 200,
        tension: 150,
        friction: 15,
      };

      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
          options: customOptions,
        })
      );

      expect(result.current).toMatchObject({
        type: 'spring',
        duration: customOptions.duration,
        physics: expect.objectContaining({
          tension: customOptions.tension,
          friction: customOptions.friction,
        }),
      });
    });

    it('should memoize preset configuration', () => {
      const { result, rerender } = renderHook(
        (props) => useAnimationPreset(props),
        {
          initialProps: {
            preset: 'FADE_IN',
            options: { duration: 300 },
          },
        }
      );

      const firstResult = result.current;
      rerender();
      expect(result.current).toBe(firstResult);
    });

    it('should update when options change', () => {
      const { result, rerender } = renderHook(
        (props) => useAnimationPreset(props),
        {
          initialProps: {
            preset: 'FADE_IN',
            options: { duration: 300 },
          },
        }
      );

      const firstResult = result.current;
      
      rerender({
        preset: 'FADE_IN',
        options: { duration: 400 },
      });

      expect(result.current).not.toBe(firstResult);
      expect(result.current.duration).toBe(400);
    });

    it('should handle invalid preset gracefully', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          // @ts-expect-error Testing invalid preset
          preset: 'INVALID_PRESET',
        })
      );

      expect(result.current).toEqual(ALERT_PRESETS.FADE_IN); // Default fallback
    });
  });

  describe('Animation Performance', () => {
    it('should not create new animation configs unnecessarily', () => {
      const createConfigSpy = jest.spyOn(ALERT_PRESETS, 'FADE_IN', 'get');
      
      const { rerender } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
        })
      );

      rerender();
      rerender();
      
      expect(createConfigSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid preset changes', () => {
      const { result, rerender } = renderHook(
        (props) => useAnimationPreset(props),
        {
          initialProps: { preset: 'FADE_IN' },
        }
      );

      for (let i = 0; i < 100; i++) {
        rerender({
          preset: i % 2 === 0 ? 'FADE_IN' : 'FADE_OUT',
        });
      }

      expect(result.current).toBeDefined();
      expect(result.current.type).toBeDefined();
    });
  });

  describe('Animation Timing', () => {
    it('should respect minimum duration', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
          options: { duration: 0 },
        })
      );

      expect(result.current.duration).toBe(TIMING.duration.minimum);
    });

    it('should respect maximum duration', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
          options: { duration: 10000 },
        })
      );

      expect(result.current.duration).toBe(TIMING.duration.maximum);
    });
  });

  describe('Animation Configuration Validation', () => {
    it('should validate physics parameters', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
          options: {
            tension: -100, // Invalid tension
            friction: -10, // Invalid friction
          },
        })
      );

      expect(result.current.physics?.tension).toBeGreaterThan(0);
      expect(result.current.physics?.friction).toBeGreaterThan(0);
    });

    it('should handle undefined options gracefully', () => {
      const { result } = renderHook(() => 
        useAnimationPreset({
          preset: 'FADE_IN',
          options: undefined,
        })
      );

      expect(result.current).toEqual(ALERT_PRESETS.FADE_IN);
    });
  });
}); 