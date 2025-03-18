/**
 * AuthNavigator.tsx
 * 
 * Manages navigation between authentication-related screens.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Auth screens
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';

// Define the auth stack param list
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Create the auth stack navigator
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator component manages navigation between auth-related screens.
 * This component is conditionally rendered based on authentication state.
 */
export default function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Hide the header for all auth screens
        animation: 'slide_from_right', // Slide animation for transitions
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}