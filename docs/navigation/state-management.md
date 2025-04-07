# State Management Documentation

This document covers state management patterns and best practices for navigation in EcoCart using Expo Router.

## Overview

EcoCart uses a combination of React Context, Zustand, and local state management to handle navigation-related state efficiently.

## Navigation State Management

### 1. Global Navigation State

```typescript
// stores/navigationStore.ts
import create from 'zustand';

interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  navigationHistory: string[];
  setCurrentRoute: (route: string) => void;
  addToHistory: (route: string) => void;
  clearHistory: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentRoute: '/',
  previousRoute: '',
  navigationHistory: [],
  setCurrentRoute: (route) => 
    set((state) => ({ 
      previousRoute: state.currentRoute,
      currentRoute: route 
    })),
  addToHistory: (route) =>
    set((state) => ({
      navigationHistory: [...state.navigationHistory, route]
    })),
  clearHistory: () => set({ navigationHistory: [] })
}));
```

### 2. Route-Specific State

```typescript
// hooks/useRouteState.ts
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

export function useRouteState<T>(initialState: T) {
  const params = useLocalSearchParams();
  const [state, setState] = useState<T>(initialState);

  // Reset state when route params change
  useEffect(() => {
    setState(initialState);
  }, [params]);

  return [state, setState] as const;
}

// Usage in screen
export default function MaterialListScreen() {
  const [filters, setFilters] = useRouteState({
    category: '',
    sortBy: 'name'
  });

  return (
    <View>
      {/* Material list with filters */}
    </View>
  );
}
```

## Form State Management

### 1. Form State with Navigation

```typescript
// hooks/useFormState.ts
import { useRouter } from 'expo-router';
import { useState } from 'react';

export function useFormState<T>(initialState: T) {
  const router = useRouter();
  const [state, setState] = useState<T>(initialState);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    try {
      await saveData(state);
      router.back();
    } catch (error) {
      // Handle error
    }
  };

  return {
    state,
    isDirty,
    handleChange,
    handleSubmit
  };
}

// Usage in form screen
export default function EditProfileScreen() {
  const { state, isDirty, handleChange, handleSubmit } = useFormState({
    name: '',
    email: ''
  });

  return (
    <View>
      <TextInput
        value={state.name}
        onChangeText={(text) => handleChange({ name: text })}
      />
      <Button 
        title="Save" 
        onPress={handleSubmit}
        disabled={!isDirty}
      />
    </View>
  );
}
```

### 2. Multi-Step Form State

```typescript
// hooks/useMultiStepForm.ts
import { useRouter } from 'expo-router';
import { useState } from 'react';

export function useMultiStepForm<T>(steps: string[], initialState: T) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialState);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      router.push(`/signup/${steps[currentStep + 1]}`);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      router.back();
    }
  };

  return {
    currentStep,
    formData,
    setFormData,
    nextStep,
    previousStep
  };
}

// Usage in multi-step form
export default function SignupScreen() {
  const steps = ['personal', 'address', 'preferences'];
  const { currentStep, formData, setFormData, nextStep, previousStep } = 
    useMultiStepForm(steps, {
      name: '',
      email: '',
      address: '',
      preferences: {}
    });

  return (
    <View>
      {/* Step-specific form content */}
    </View>
  );
}
```

## Modal State Management

### 1. Modal State with Context

```typescript
// contexts/ModalContext.tsx
import { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isVisible: boolean;
  modalType: string | null;
  showModal: (type: string) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const showModal = (type: string) => {
    setModalType(type);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    setModalType(null);
  };

  return (
    <ModalContext.Provider value={{ isVisible, modalType, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// Usage in component
export function MyComponent() {
  const { showModal } = useContext(ModalContext);

  return (
    <Button 
      onPress={() => showModal('ar-scan')}
      title="Scan Material"
    />
  );
}
```

## Best Practices

1. **State Organization**
   - Use appropriate state management tools
   - Keep state close to where it's used
   - Implement proper state cleanup

2. **Performance**
   - Memoize expensive computations
   - Use proper state updates
   - Implement proper cleanup

3. **Type Safety**
   - Use TypeScript for state types
   - Implement proper type checking
   - Handle edge cases

4. **State Persistence**
   - Handle state restoration
   - Implement proper caching
   - Manage offline state

## Common Issues and Solutions

1. **State Synchronization**
   - Use proper state updates
   - Handle race conditions
   - Implement proper cleanup

2. **Memory Management**
   - Clear unused state
   - Handle component unmounting
   - Implement proper cleanup

3. **State Updates**
   - Use proper update patterns
   - Handle concurrent updates
   - Implement proper validation 