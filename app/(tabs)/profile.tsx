import React from 'react';
import { View } from 'react-native';
import { LazyScreen } from '../../src/components/common/LazyScreen';
import { useScreenCleanup } from '../../src/hooks/useScreenCleanup';

export default function ProfileScreen() {
  useScreenCleanup('profile');

  return (
    <View style={{ flex: 1 }}>
      <LazyScreen component={() => import('../../src/screens/profile/ProfileScreen')} />
    </View>
  );
} 