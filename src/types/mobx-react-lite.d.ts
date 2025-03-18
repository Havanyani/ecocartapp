declare module 'mobx-react-lite' {
    
  export function observer<P extends object>(
    component: React.ComponentType<P>
  ): React.ComponentType<P>;
} 