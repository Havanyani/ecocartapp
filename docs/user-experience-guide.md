# EcoCart User Experience Guide

## Overview

This guide documents the user experience design, implementation, and best practices for the EcoCart application. Creating a consistent, intuitive, and accessible user experience is critical for user adoption and satisfaction. This document outlines the principles, components, and techniques used to create an exceptional user experience.

## Table of Contents

1. [Onboarding Flow](#onboarding-flow)
2. [Guided Tutorials](#guided-tutorials)
3. [Accessibility Features](#accessibility-features)
4. [Theme System](#theme-system)
5. [Loading States & Transitions](#loading-states--transitions)
6. [Error Handling & Recovery](#error-handling--recovery)
7. [Best Practices](#best-practices)

## Onboarding Flow

### Architecture

The onboarding flow is designed to provide a smooth introduction to the app's core features while collecting necessary user information. The architecture uses a step-based approach with progress tracking:

```
┌─────────────┐      ┌────────────┐      ┌───────────────┐      ┌──────────────┐
│             │      │            │      │               │      │              │
│  Welcome    ├─────►│  Account   ├─────►│  Permissions  ├─────►│  Preference  │
│  Screen     │      │  Creation  │      │  Requests     │      │  Setup       │
│             │      │            │      │               │      │              │
└─────────────┘      └────────────┘      └───────────────┘      └──────────────┘
                                                                       │
                                                                       ▼
┌─────────────┐      ┌────────────┐                           ┌──────────────┐
│             │      │            │                           │              │
│  Home       │◄─────┤  Success   │◄──────────────────────────┤  Tutorial    │
│  Screen     │      │  Screen    │                           │  Overview    │
│             │      │            │                           │              │
└─────────────┘      └────────────┘                           └──────────────┘
```

### Key Components

- **OnboardingProvider** (`src/providers/OnboardingProvider.tsx`): Manages onboarding state
- **OnboardingScreen** (`src/screens/onboarding/OnboardingScreen.tsx`): Container for onboarding steps
- **OnboardingStep** (`src/components/onboarding/OnboardingStep.tsx`): Individual step component
- **OnboardingProgress** (`src/components/onboarding/OnboardingProgress.tsx`): Progress indicator

### Implementation

The onboarding implementation uses a combination of context for state management and a step-based UI:

```typescript
// Usage example of the onboarding system
import { useOnboarding } from '../hooks/useOnboarding';

function OnboardingContainer() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipOnboarding,
    completeOnboarding 
  } = useOnboarding();
  
  return (
    <View style={styles.container}>
      <OnboardingProgress current={currentStep} total={totalSteps} />
      
      {/* Dynamic step content */}
      <OnboardingStep step={currentStep} />
      
      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <Button title="Back" onPress={prevStep} variant="secondary" />
        )}
        
        {currentStep < totalSteps ? (
          <Button title="Next" onPress={nextStep} variant="primary" />
        ) : (
          <Button title="Get Started" onPress={completeOnboarding} variant="primary" />
        )}
        
        <TextButton title="Skip" onPress={skipOnboarding} />
      </View>
    </View>
  );
}
```

### Analytics Integration

The onboarding flow tracks key metrics:

- Completion rate (overall and per step)
- Time spent on each step
- Skip rate
- Most common drop-off points

## Guided Tutorials

### Architecture

Guided tutorials provide contextual help for key features through interactive overlays and step-by-step instructions:

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Feature       │     │  Tutorial      │     │  Step          │
│  Detection     │────►│  Trigger       │────►│  Progression   │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
                                                     │
                                                     ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Completion    │◄────┤  User          │◄────┤  Interactive   │
│  Tracking      │     │  Interaction   │     │  Highlight     │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### Key Components

- **TutorialProvider** (`src/providers/TutorialProvider.tsx`): Manages tutorial state
- **TutorialOverlay** (`src/components/tutorial/TutorialOverlay.tsx`): Renders tutorial UI
- **TutorialStep** (`src/components/tutorial/TutorialStep.tsx`): Individual tutorial step
- **TutorialHighlight** (`src/components/tutorial/TutorialHighlight.tsx`): Highlights UI elements

### Implementation

The tutorial system can be triggered automatically or manually:

```typescript
// Example usage of the tutorial system
import { useTutorial } from '../hooks/useTutorial';

function FeatureComponent() {
  const { 
    startTutorial, 
    isTutorialActive, 
    currentFeatureTutorial 
  } = useTutorial();
  
  // Start a specific tutorial
  const handleHelpPress = () => {
    startTutorial('scheduleCollection');
  };
  
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Schedule Collection</Text>
        <IconButton 
          icon="help-circle" 
          onPress={handleHelpPress} 
          accessibilityLabel="Get help with scheduling"
        />
        
        {/* Main feature content */}
      </View>
      
      {/* Tutorial overlay renders outside normal view hierarchy */}
      {isTutorialActive && currentFeatureTutorial === 'scheduleCollection' && (
        <TutorialOverlay feature="scheduleCollection" />
      )}
    </>
  );
}
```

### Tutorial Content Management

Tutorials are defined using a structured format:

```typescript
// Example tutorial definition
const TUTORIALS = {
  scheduleCollection: {
    steps: [
      {
        target: 'date-picker',
        title: 'Select a Date',
        description: 'Tap to choose when you want your collection to happen.',
        position: 'bottom'
      },
      {
        target: 'material-selector',
        title: 'Choose Materials',
        description: 'Select which materials you want to recycle.',
        position: 'top'
      },
      // Additional steps...
    ],
    triggers: {
      automatic: {
        onFirstVisit: true,
        onFeatureUpdate: true
      },
      manual: true
    }
  },
  // Other tutorials...
};
```

## Accessibility Features

### Principles

The app adheres to WCAG 2.1 AA standards, ensuring usability for people with various disabilities:

1. **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
2. **Operable**: UI components and navigation must be operable
3. **Understandable**: Information and operation of the UI must be understandable
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents

### Key Features

#### Screen Reader Support
- All interactive elements have accessibility labels
- Custom components implement the proper accessibility roles
- Meaningful reading order is maintained
- Status updates use announceForAccessibility

```typescript
// Example of screen reader support implementation
function AccessibleButton({ onPress, label, hint }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
```

#### Dynamic Text Sizing
- Text scales according to system settings
- Layouts adjust to accommodate larger text
- Minimum text size ensures readability

```typescript
// Example of dynamic text sizing
import { useAccessibility } from '../hooks/useAccessibility';

function ScalableText({ children, style }) {
  const { fontScale } = useAccessibility();
  
  return (
    <Text 
      style={[
        style, 
        { fontSize: (style?.fontSize || 16) * fontScale }
      ]}
    >
      {children}
    </Text>
  );
}
```

#### Contrast and Color
- Color is not the only means of conveying information
- Text has sufficient contrast against backgrounds
- Interactive elements have visual focus indicators
- Color-blind friendly palettes are used

#### Touch Target Sizing
- Interactive elements have a minimum touch target of 44x44 points
- Sufficient spacing between touch targets
- Important actions have larger touch areas

### Testing and Validation

Accessibility is tested through:
- Automated testing with accessibility linters
- Manual testing with screen readers (VoiceOver, TalkBack)
- Simulation of various visual impairments
- User testing with people with disabilities

## Theme System

### Architecture

The theme system provides consistent styling across the app, with support for light and dark modes, as well as adaptability to user preferences:

```
┌────────────────┐     ┌─────────────────┐     ┌────────────────┐
│                │     │                 │     │                │
│  Theme         │     │  Component      │     │  Styled        │
│  Provider      │────►│  Theme Hooks    │────►│  Components    │
│                │     │                 │     │                │
└────────────────┘     └─────────────────┘     └────────────────┘
        │                                             │
        ▼                                             ▼
┌────────────────┐                           ┌────────────────┐
│                │                           │                │
│  System        │                           │  Dynamic       │
│  Preferences   │                           │  Theming       │
│                │                           │                │
└────────────────┘                           └────────────────┘
```

### Theme Definition

Themes are defined as structured objects:

```typescript
// Example theme definition
const lightTheme = {
  colors: {
    primary: '#34D399',
    secondary: '#0891B2',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1F2937',
    textSecondary: '#6B7280',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    border: '#E5E7EB'
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 24,
    round: 9999
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semibold: 'Inter-SemiBold',
      bold: 'Inter-Bold'
    },
    fontSize: {
      xs: 12,
      small: 14,
      medium: 16,
      large: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8
    }
  }
};

const darkTheme = {
  colors: {
    primary: '#34D399',
    secondary: '#0891B2',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    border: '#374151'
  },
  // Other properties same as light theme...
};
```

### Implementation

The theme system is implemented using React Context:

```typescript
// Example usage of the theme system
import { useTheme } from '../hooks/useTheme';

function ThemedComponent() {
  const { colors, spacing, typography, isDark, setTheme } = useTheme();
  
  return (
    <View style={{
      backgroundColor: colors.background,
      padding: spacing.medium,
      borderRadius: borderRadius.medium
    }}>
      <Text style={{
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.medium,
        color: colors.text
      }}>
        Themed Content
      </Text>
      
      <Button
        title={isDark ? "Switch to Light" : "Switch to Dark"}
        onPress={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </View>
  );
}
```

### System Integration

The theme system respects system preferences:

```typescript
// Example of system theme integration
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

function ThemeSystemIntegration() {
  const systemColorScheme = useColorScheme();
  const { setTheme, themeMode } = useTheme();
  
  useEffect(() => {
    // Only apply system theme if user hasn't explicitly set a preference
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, themeMode]);
  
  // Component content...
}
```

## Loading States & Transitions

### Principles

Loading states and transitions follow these principles:

1. **Feedback**: Always provide feedback during loading
2. **Consistency**: Use consistent loading patterns
3. **Progressive**: Show content as soon as it's available
4. **Optimistic**: Assume actions will succeed when appropriate
5. **Graceful**: Handle errors without disrupting the flow

### Loading Patterns

#### Global Loading
- Used for initial app loading and major transitions
- Implemented using a splash screen or full-screen loader
- Minimal and branded appearance

```typescript
// Example of global loading
function AppLoading() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Loading EcoCart...</Text>
    </View>
  );
}
```

#### Content Loading
- Used when loading specific content areas
- Implemented using skeleton screens or content placeholders
- Mimics the shape of the expected content

```typescript
// Example of skeleton loading
function MaterialCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.imagePlaceholder, styles.skeleton]} />
      <View style={styles.content}>
        <View style={[styles.titlePlaceholder, styles.skeleton]} />
        <View style={[styles.descriptionPlaceholder, styles.skeleton]} />
        <View style={[styles.buttonPlaceholder, styles.skeleton]} />
      </View>
    </View>
  );
}
```

#### Action Loading
- Used during user actions (save, submit, etc.)
- Implemented using button loading states
- Provides feedback without blocking the UI

```typescript
// Example of action loading
function ActionButton({ title, onPress, isLoading }) {
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
```

### Transitions

Animations and transitions enhance the perceived performance and provide visual continuity:

```typescript
// Example of a screen transition
import { useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';

function MaterialCard({ material, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <SharedElement id={`material.${material.id}.image`}>
        <Image source={{ uri: material.imageUrl }} style={styles.image} />
      </SharedElement>
      
      <SharedElement id={`material.${material.id}.title`}>
        <Text style={styles.title}>{material.name}</Text>
      </SharedElement>
    </TouchableOpacity>
  );
}
```

### Implementation

Loading states are managed through hooks:

```typescript
// Example loading state hook
import { useState, useCallback } from 'react';

function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  
  const withLoading = useCallback(async (asyncFunction) => {
    try {
      setIsLoading(true);
      const result = await asyncFunction();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { isLoading, withLoading };
}

// Usage example
function SubmitForm() {
  const { isLoading, withLoading } = useLoading();
  
  const handleSubmit = async () => {
    await withLoading(async () => {
      // Async operation
      await submitData();
    });
  };
  
  return (
    <Button 
      title="Submit" 
      onPress={handleSubmit} 
      isLoading={isLoading} 
    />
  );
}
```

## Error Handling & Recovery

### Principles

Error handling follows these principles:

1. **Clarity**: Clearly communicate what went wrong
2. **Context**: Provide relevant context for the error
3. **Recovery**: Offer ways to recover when possible
4. **Prevention**: Help users avoid making errors

### Error Patterns

#### Form Validation
- Validate input as users type
- Show inline validation messages
- Highlight problematic fields
- Provide suggestions for correction

```typescript
// Example of form validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

function RegistrationForm() {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: values => {
      // Submit form
    }
  });
  
  return (
    <View style={styles.form}>
      <TextField
        label="Email"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        error={formik.touched.email && formik.errors.email}
        keyboardType="email-address"
      />
      
      {/* Other fields */}
      
      <Button 
        title="Register" 
        onPress={formik.handleSubmit} 
        disabled={!formik.isValid || formik.isSubmitting}
      />
    </View>
  );
}
```

#### Network Errors
- Show appropriate error messages
- Offer retry options
- Provide offline alternatives when applicable
- Cache previous successful responses

```typescript
// Example of network error handling
function MaterialList() {
  const { data, isLoading, error, refetch } = useMaterials();
  
  if (isLoading) {
    return <MaterialListSkeleton />;
  }
  
  if (error) {
    return (
      <ErrorState
        title="Couldn't Load Materials"
        message={getErrorMessage(error)}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }
  
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <MaterialCard material={item} />}
      keyExtractor={item => item.id}
    />
  );
}
```

#### System Errors
- Use error boundaries to catch rendering errors
- Provide graceful fallbacks
- Log errors for debugging
- Allow users to report issues

```typescript
// Example of error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    // Log error to service
    logErrorToService(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We're sorry, but there was an error in this section.
          </Text>
          <Button 
            title="Report Problem" 
            onPress={this.reportError} 
            variant="secondary"
          />
          <Button 
            title="Try Again" 
            onPress={this.resetError} 
            variant="primary"
          />
        </View>
      );
    }
    
    return this.props.children;
  }
  
  resetError = () => {
    this.setState({ hasError: false, error: null });
  };
  
  reportError = () => {
    // Open bug report form
  };
}
```

## Best Practices

### Design Consistency

- Follow the EcoCart Design System
- Use established UI patterns
- Maintain consistent spacing and sizing
- Ensure UI elements behave predictably

### Performance Impact

- Minimize JavaScript execution during animations
- Use native drivers for animations
- Implement virtualization for long lists
- Optimize image loading and rendering

### Testing

- Test on various device sizes and orientations
- Test with assistive technologies
- Conduct usability testing with real users
- Implement automated UI tests

### Iterative Improvements

- Collect usage analytics
- Analyze user behavior patterns
- A/B test important UI changes
- Incorporate user feedback

## References

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Material Design Principles](https://material.io/design/introduction)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) 