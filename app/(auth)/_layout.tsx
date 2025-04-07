import { Stack } from 'expo-router/stack';
import { Animated } from 'react-native';
import { useTransitionOptimization } from '../../src/hooks/useTransitionOptimization';

export default function AuthLayout() {
  const { transitionAnim } = useTransitionOptimization();

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: transitionAnim,
        transform: [{
          translateY: transitionAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}
    >
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Sign Up',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            title: 'Forgot Password',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            title: 'Reset Password',
            headerShown: false,
          }}
        />
      </Stack>
    </Animated.View>
  );
} 