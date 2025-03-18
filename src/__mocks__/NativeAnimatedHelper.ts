interface AnimatedValue {
  value: number;
  setValue: (value: number) => void;
  setOffset: (offset: number) => void;
  flattenOffset: () => void;
  extractOffset: () => void;
  addListener: (callback: (value: { value: number }) => void) => string;
  removeListener: (id: string) => void;
  removeAllListeners: () => void;
  stopAnimation: (callback?: (value: number) => void) => void;
  resetAnimation: (callback?: (value: number) => void) => void;
  setNativeProps: (props: { [key: string]: any }) => void;
}

interface AnimatedConfig {
  useNativeDriver?: boolean;
  isInteraction?: boolean;
  listener?: (result: { finished: boolean }) => void;
}

interface AnimatedTimingConfig extends AnimatedConfig {
  duration?: number;
  easing?: (value: number) => number;
}

interface AnimatedSpringConfig extends AnimatedConfig {
  friction?: number;
  tension?: number;
  useNativeDriver?: boolean;
}

interface AnimatedDecayConfig extends AnimatedConfig {
  velocity?: number;
  deceleration?: number;
}

interface CompositeAnimation {
  start: (callback?: (result: { finished: boolean }) => void) => void;
  stop: () => void;
  reset: () => void;
}

export class Animated {
  static Value = class implements AnimatedValue {
    value: number;

    constructor(value: number) {
      this.value = value;
    }

    setValue(value: number): void {
      this.value = value;
    }

    setOffset(offset: number): void {
      this.value += offset;
    }

    flattenOffset(): void {
      // No-op in mock
    }

    extractOffset(): void {
      // No-op in mock
    }

    addListener(callback: (value: { value: number }) => void): string {
      return 'mock-listener-id';
    }

    removeListener(id: string): void {
      // No-op in mock
    }

    removeAllListeners(): void {
      // No-op in mock
    }

    stopAnimation(callback?: (value: number) => void): void {
      if (callback) {
        callback(this.value);
      }
    }

    resetAnimation(callback?: (value: number) => void): void {
      if (callback) {
        callback(this.value);
      }
    }

    setNativeProps(props: { [key: string]: any }): void {
      // No-op in mock
    }
  };

  static timing(
    value: AnimatedValue,
    config: AnimatedTimingConfig
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static spring(
    value: AnimatedValue,
    config: AnimatedSpringConfig
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static decay(
    value: AnimatedValue,
    config: AnimatedDecayConfig
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static sequence(
    animations: CompositeAnimation[]
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static parallel(
    animations: CompositeAnimation[]
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static delay(time: number): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static loop(
    animation: CompositeAnimation,
    config?: { iterations?: number }
  ): CompositeAnimation {
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        if (callback) {
          callback({ finished: true });
        }
      },
      stop: () => {},
      reset: () => {},
    };
  }

  static event(
    argMapping: any[],
    config: { listener?: (result: any) => void }
  ): any {
    return {
      __isNative: false,
    };
  }

  static addListener(
    value: AnimatedValue,
    type: string,
    listener: Function
  ): string {
    return 'mock-listener-id';
  }

  static removeListener(
    value: AnimatedValue,
    type: string,
    listener: Function
  ): void {
    // No-op in mock
  }

  static removeAllListeners(value: AnimatedValue): void {
    // No-op in mock
  }

  static View: any = class {
    static displayName = 'Animated.View';
  };

  static Text: any = class {
    static displayName = 'Animated.Text';
  };

  static Image: any = class {
    static displayName = 'Animated.Image';
  };

  static ScrollView: any = class {
    static displayName = 'Animated.ScrollView';
  };

  static FlatList: any = class {
    static displayName = 'Animated.FlatList';
  };

  static SectionList: any = class {
    static displayName = 'Animated.SectionList';
  };

  static createAnimatedComponent(component: any): any {
    return component;
  }
}

export default Animated; 