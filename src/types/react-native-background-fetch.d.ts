declare module 'react-native-background-fetch' {
  export interface BackgroundFetchConfig {
    minimumFetchInterval: number;
    stopOnTerminate?: boolean;
    enableHeadless?: boolean;
    startOnBoot?: boolean;
    requiredNetworkType?: number;
    requiresCharging?: boolean;
    requiresDeviceIdle?: boolean;
    requiresBatteryNotLow?: boolean;
    requiresStorageNotLow?: boolean;
  }

  export type BackgroundFetchStatus = 0 | 1 | 2;

  const BackgroundFetch: {
    configure: (
      config: BackgroundFetchConfig,
      callback: (taskId: string) => Promise<void>,
      errorCallback?: (error: Error) => void
    ) => Promise<void>;
    status: () => Promise<BackgroundFetchStatus>;
    finish: (taskId: string) => void;
    start: () => Promise<BackgroundFetchStatus>;
    stop: () => Promise<boolean>;

    STATUS_RESTRICTED: 0;
    STATUS_DENIED: 1;
    STATUS_AVAILABLE: 2;

    NETWORK_TYPE_NONE: 0;
    NETWORK_TYPE_ANY: 1;
    NETWORK_TYPE_UNMETERED: 2;
    NETWORK_TYPE_NOT_ROAMING: 3;
    NETWORK_TYPE_CELLULAR: 4;
  };

  export default BackgroundFetch;
} 