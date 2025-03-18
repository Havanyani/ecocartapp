import aiPerformanceMonitor from './AIPerformanceMonitor';
import { instrument } from './Instrumentation';

/**
 * Initializes performance monitoring for the AI Assistant
 * This should be called during app startup
 */
export const initializePerformanceMonitoring = async (): Promise<void> => {
  // Load any existing metrics from storage
  await aiPerformanceMonitor.loadMetrics();
  
  // Enable monitoring by default in development, disabled in production
  const isProduction = process.env.NODE_ENV === 'production';
  aiPerformanceMonitor.setEnabled(!isProduction);
  
  console.log(`[Performance] Monitoring ${aiPerformanceMonitor.isMonitoringEnabled() ? 'enabled' : 'disabled'}`);
};

/**
 * Creates an instrumented version of a component's render method
 * to track component rendering performance
 * 
 * @param ComponentClass The React component class to instrument
 * @param componentName The name of the component (for metrics)
 * @returns The instrumented component
 */
export function instrumentComponent<T extends React.ComponentType<any>>(
  ComponentClass: T, 
  componentName: string
): T {
  const OriginalRender = ComponentClass.prototype.render;
  
  // Instrument the render method to track performance
  ComponentClass.prototype.render = instrument(
    function() {
      return OriginalRender.apply(this);
    },
    'render_time',
    `${componentName}.render`
  );
  
  return ComponentClass;
}

export default initializePerformanceMonitoring; 