/**
 * LazyScreen/index.ts
 * 
 * Platform selector for the LazyScreen component.
 * Exports the appropriate implementation based on the platform.
 */

import { Platform } from 'react-native';
import MobileLazyScreen from './MobileLazyScreen';
import WebLazyScreen from './WebLazyScreen';

export { LoadingState } from './shared';
export type { LazyScreenMetrics, LazyScreenProps } from './shared';

// Select the appropriate implementation based on platform
const LazyScreen = Platform.select({
  web: WebLazyScreen,
  default: MobileLazyScreen,
});

export default LazyScreen; 