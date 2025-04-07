declare module 'expo-router' {
  import { LinkProps as OriginalLinkProps } from '@react-navigation/native';
    import { ComponentType } from 'react';

  export interface LinkProps extends Omit<OriginalLinkProps, 'to'> {
    href: string;
  }

  export const Link: ComponentType<LinkProps>;
  export const useRouter: () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };
  export const useLocalSearchParams: <T = Record<string, string>>() => T;
  export const useSegments: () => string[];
  export const Stack: ComponentType<any>;
  export const Slot: ComponentType<any>;
  export const Tabs: ComponentType<any>;
} 