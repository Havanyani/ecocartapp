import { PERFORMANCE_MARKS } from '@/constants';
import type { PerformanceMetrics } from '@/types/gesture';

export interface PerformanceMetrics {
  mountTime: number;
  animationTime: number;
}

export function markMountStart(): void {
  performance.mark(PERFORMANCE_MARKS.MOUNT);
}

export function markAnimationEnd(): void {
  performance.mark(PERFORMANCE_MARKS.ANIMATION_END);
  performance.measure(
    'alert-animation',
    PERFORMANCE_MARKS.ANIMATION_START,
    PERFORMANCE_MARKS.ANIMATION_END
  );
}

export function cleanupPerformanceMarks(): void {
  performance.clearMarks();
  performance.clearMeasures();
}

interface PerformanceEntry {
  type: 'animation' | 'gesture' | 'render' | 'collision';
  startTime: number;
  endTime: number;
  duration: number;
  data?: Record<string, unknown>;
}

interface PerformanceProfile {
  fps: number;
  frameTime: number;
  jank: number;
  entries: PerformanceEntry[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private entries: PerformanceEntry[] = [];
  private frameTimestamps: number[] = [];
  private isRecording = false;
  private startTime = 0;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startRecording(): void {
    this.isRecording = true;
    this.startTime = performance.now();
    this.entries = [];
    this.frameTimestamps = [];
    this.recordFrames();
  }

  stopRecording(): PerformanceProfile {
    this.isRecording = false;
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    // Calculate FPS
    const frames = this.frameTimestamps.length;
    const fps = (frames / duration) * 1000;

    // Calculate frame times
    const frameTimes = this.frameTimestamps.slice(1).map((time, i) => 
      time - this.frameTimestamps[i]
    );
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

    // Count janky frames (>16ms)
    const jankFrames = frameTimes.filter(time => time > 16.67).length;

    return {
      fps,
      frameTime: avgFrameTime,
      jank: (jankFrames / frames) * 100,
      entries: this.entries,
    };
  }

  private recordFrames(): void {
    if (!this.isRecording) return;

    this.frameTimestamps.push(performance.now());
    requestAnimationFrame(() => this.recordFrames());
  }

  mark(type: PerformanceEntry['type'], data?: Record<string, unknown>): () => void {
    if (!this.isRecording) return () => {};

    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.entries.push({
        type,
        startTime,
        endTime,
        duration: endTime - startTime,
        data,
      });
    };
  }

  getMetrics(): PerformanceMetrics {
    const animations = this.entries.filter(e => e.type === 'animation');
    const gestures = this.entries.filter(e => e.type === 'gesture');
    const collisions = this.entries.filter(e => e.type === 'collision');

    return {
      averageFrameTime: this.frameTimestamps.length > 1 
        ? (this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0]) / (this.frameTimestamps.length - 1)
        : 0,
      droppedFrames: this.frameTimestamps
        .slice(1)
        .filter((t, i) => t - this.frameTimestamps[i] > 16.67).length,
      totalFrames: this.frameTimestamps.length,
      gestureCount: gestures.length,
      dismissCount: animations.filter(a => a.data?.isDismiss).length,
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance hooks
export function usePerformanceMonitoring(enabled: boolean = false) {
  React.useEffect(() => {
    if (!enabled) return;
    
    performanceMonitor.startRecording();
    return () => {
      const profile = performanceMonitor.stopRecording();
      console.log('Performance Profile:', profile);
    };
  }, [enabled]);

  return {
    markOperation: performanceMonitor.mark.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
  };
} 