declare module 'expo-vector-icons' {
  import { ViewStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: ViewStyle;
  }

  export function MaterialIcons(props: IconProps): JSX.Element;
  export function MaterialCommunityIcons(props: IconProps): JSX.Element;
  export function Ionicons(props: IconProps): JSX.Element;
  export function FontAwesome(props: IconProps): JSX.Element;
  export function FontAwesome5(props: IconProps): JSX.Element;
  export function Feather(props: IconProps): JSX.Element;
  export function AntDesign(props: IconProps): JSX.Element;
  export function Entypo(props: IconProps): JSX.Element;
  export function SimpleLineIcons(props: IconProps): JSX.Element;
  export function Octicons(props: IconProps): JSX.Element;
  export function Zocial(props: IconProps): JSX.Element;
  export function Fontisto(props: IconProps): JSX.Element;
  export function EvilIcons(props: IconProps): JSX.Element;
  export function Foundation(props: IconProps): JSX.Element;

  const icons: {
    MaterialIcons: typeof MaterialIcons;
    MaterialCommunityIcons: typeof MaterialCommunityIcons;
    Ionicons: typeof Ionicons;
    FontAwesome: typeof FontAwesome;
    FontAwesome5: typeof FontAwesome5;
    Feather: typeof Feather;
    AntDesign: typeof AntDesign;
    Entypo: typeof Entypo;
    SimpleLineIcons: typeof SimpleLineIcons;
    Octicons: typeof Octicons;
    Zocial: typeof Zocial;
    Fontisto: typeof Fontisto;
    EvilIcons: typeof EvilIcons;
    Foundation: typeof Foundation;
  };

  export default icons;
}

declare module 'react-native-reanimated' {
  import { Animated } from 'react-native';

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

  export class Reanimated {
    static Value: typeof Animated.Value;
    static timing: typeof Animated.timing;
    static spring: typeof Animated.spring;
    static decay: typeof Animated.decay;
    static sequence: typeof Animated.sequence;
    static parallel: typeof Animated.parallel;
    static delay: typeof Animated.delay;
    static loop: typeof Animated.loop;
    static event: typeof Animated.event;
    static addListener: typeof Animated.addListener;
    static removeListener: typeof Animated.removeListener;
    static removeAllListeners: typeof Animated.removeAllListeners;
    static View: typeof Animated.View;
    static Text: typeof Animated.Text;
    static Image: typeof Animated.Image;
    static ScrollView: typeof Animated.ScrollView;
    static FlatList: typeof Animated.FlatList;
    static SectionList: typeof Animated.SectionList;
    static createAnimatedComponent: typeof Animated.createAnimatedComponent;
  }

  export default Reanimated;
} 