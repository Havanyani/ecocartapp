import { Stack } from 'expo-router/stack';
import { Animated } from 'react-native';
import { useTransitionOptimization } from '../../src/hooks/useTransitionOptimization';

export default function ModalLayout() {
  const { transitionAnim } = useTransitionOptimization();

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: transitionAnim,
        transform: [{
          translateY: transitionAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      }}
    >
      <Stack
        screenOptions={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen
          name="ar-scan"
          options={{
            title: 'AR Scanner',
          }}
        />
        <Stack.Screen
          name="material-details"
          options={{
            title: 'Material Details',
          }}
        />
        <Stack.Screen
          name="collection-details"
          options={{
            title: 'Collection Details',
          }}
        />
      </Stack>
    </Animated.View>
  );
} 