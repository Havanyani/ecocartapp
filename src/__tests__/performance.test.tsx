import { performanceMonitor } from '../components/notifications/utils/performance';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performanceMonitor.startRecording();
  });

  afterEach(() => {
    performanceMonitor.stopRecording();
  });

  describe('Performance Marks', () => {
    it('should record animation marks correctly', () => {
      const endMark = performanceMonitor.mark('animation', {
        type: 'setup',
        component: 'CollectionAlert',
      });

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      endMark();
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.entries.find(e => e.type === 'animation')).toBeDefined();
    });

    it('should track frame times accurately', () => {
      // Simulate frame updates
      const frames = 60;
      const frameDuration = 16.67; // 60fps

      for (let i = 0; i < frames; i++) {
        jest.advanceTimersByTime(frameDuration);
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.averageFrameTime).toBeCloseTo(frameDuration, 1);
    });
  });

  describe('Performance Metrics', () => {
    it('should detect dropped frames', () => {
      // Simulate some dropped frames
      jest.advanceTimersByTime(50); // Long frame

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.droppedFrames).toBeGreaterThan(0);
    });

    it('should track gesture performance', () => {
      const endMark = performanceMonitor.mark('gesture', {
        type: 'pan',
        distance: 100,
      });

      endMark();
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.gestureCount).toBe(1);
    });
  });

  describe('Performance Profiling', () => {
    it('should generate complete performance profile', () => {
      // Record various operations
      performanceMonitor.mark('animation')();
      performanceMonitor.mark('gesture')();
      performanceMonitor.mark('render')();

      const profile = performanceMonitor.stopRecording();
      expect(profile).toMatchObject({
        fps: expect.any(Number),
        jank: expect.any(Number),
        entries: expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/animation|gesture|render/),
            duration: expect.any(Number),
          }),
        ]),
      });
    });

    it('should handle concurrent operations', () => {
      const marks = Array.from({ length: 10 }, (_, i) => 
        performanceMonitor.mark('animation', { id: i })
      );

      marks.forEach(endMark => endMark());
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.entries).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle recording when stopped', () => {
      performanceMonitor.stopRecording();
      const endMark = performanceMonitor.mark('animation');
      endMark();
      expect(() => performanceMonitor.getMetrics()).not.toThrow();
    });

    it('should handle invalid mark types', () => {
      // @ts-expect-error Testing invalid mark type
      const endMark = performanceMonitor.mark('invalid');
      endMark();
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.entries.length).toBe(0);
    });
  });

  describe('Memory Management', () => {
    it('should cleanup old entries on reset', () => {
      for (let i = 0; i < 100; i++) {
        performanceMonitor.mark('animation')();
      }

      performanceMonitor.stopRecording();
      performanceMonitor.startRecording();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.entries).toHaveLength(0);
    });

    it('should limit entry history', () => {
      const MAX_ENTRIES = 1000;
      for (let i = 0; i < MAX_ENTRIES + 100; i++) {
        performanceMonitor.mark('animation')();
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.entries.length).toBeLessThanOrEqual(MAX_ENTRIES);
    });
  });
}); 