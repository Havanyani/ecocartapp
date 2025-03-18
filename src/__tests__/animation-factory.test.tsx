import { Animated } from 'react-native';
import { AnimationTestRunner, expectSmoothAnimation } from '../components/notifications/test-utils/animation-test';
import { createAnimation } from '../components/notifications/utils/animation-factory';
import { ALERT_PRESETS } from '../components/notifications/utils/animation-presets';

describe('Animation Factory', () => {
  let animationRunner: AnimationTestRunner;
  let animatedValue: Animated.Value;

  beforeEach(() => {
    animationRunner = new AnimationTestRunner();
    animatedValue = new Animated.Value(0);
    jest.spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        animationRunner.mockRequestAnimationFrame(cb);
        return 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Animation Creation', () => {
    it('should create spring animation correctly', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.FADE_IN
      );

      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
      expect(animation.start).toBeDefined();
    });

    it('should create bounce animation correctly', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.BOUNCE_OUT
      );

      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should create elastic animation correctly', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.ELASTIC_IN
      );

      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });
  });

  describe('Animation Execution', () => {
    it('should animate to target value', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.FADE_IN
      );

      animation.start();

      const values = animationRunner.runAnimation({
        duration: ALERT_PRESETS.FADE_IN.duration,
        fromValue: 0,
        toValue: 1,
      });

      expectSmoothAnimation(values);
      expect(values[values.length - 1]).toBeCloseTo(1);
    });

    it('should handle callback completion', (done) => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.FADE_IN
      );

      animation.start(({ finished }) => {
        expect(finished).toBe(true);
        done();
      });

      animationRunner.runAnimation({
        duration: ALERT_PRESETS.FADE_IN.duration,
        fromValue: 0,
        toValue: 1,
      });
    });
  });

  describe('Animation Configuration', () => {
    it('should respect native driver setting', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        {
          ...ALERT_PRESETS.FADE_IN,
          useNativeDriver: false,
        }
      );

      const config = (animation as any)._animation.config;
      expect(config.useNativeDriver).toBe(false);
    });

    it('should handle custom easing functions', () => {
      const customEasing = (t: number) => t * t;
      const animation = createAnimation(
        animatedValue,
        1,
        {
          ...ALERT_PRESETS.FADE_IN,
          easing: customEasing,
        }
      );

      const config = (animation as any)._animation.config;
      expect(config.easing).toBe(customEasing);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid animation types', () => {
      expect(() => {
        createAnimation(
          animatedValue,
          1,
          {
            // @ts-expect-error Testing invalid type
            type: 'invalid',
            duration: 300,
          }
        );
      }).toThrow();
    });

    it('should handle null animated values', () => {
      expect(() => {
        createAnimation(
          null as any,
          1,
          ALERT_PRESETS.FADE_IN
        );
      }).toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid animation creation', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        createAnimation(
          animatedValue,
          1,
          ALERT_PRESETS.FADE_IN
        );
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });

    it('should cleanup resources properly', () => {
      const animation = createAnimation(
        animatedValue,
        1,
        ALERT_PRESETS.FADE_IN
      );

      const stopSpy = jest.spyOn(animation, 'stop');
      animation.stop();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('Composite Animations', () => {
    it('should handle parallel animations', () => {
      const scale = new Animated.Value(0);
      const opacity = new Animated.Value(0);

      const scaleAnim = createAnimation(scale, 1, ALERT_PRESETS.SCALE_IN);
      const opacityAnim = createAnimation(opacity, 1, ALERT_PRESETS.FADE_IN);

      const parallel = Animated.parallel([scaleAnim, opacityAnim]);
      expect(parallel).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should handle sequence animations', () => {
      const value = new Animated.Value(0);

      const first = createAnimation(value, 0.5, ALERT_PRESETS.FADE_IN);
      const second = createAnimation(value, 1, ALERT_PRESETS.FADE_IN);

      const sequence = Animated.sequence([first, second]);
      expect(sequence).toBeInstanceOf(Animated.CompositeAnimation);
    });
  });
}); 