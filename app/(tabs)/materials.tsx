import React from 'react';
import { View } from 'react-native';
import { LazyScreen } from '../../src/components/common/LazyScreen';
import { MaterialTopTabs } from '../../src/components/navigation/MaterialTopTabs';
import { useScreenCleanup } from '../../src/hooks/useScreenCleanup';

export default function MaterialsScreen() {
  useScreenCleanup('materials');

  const screens = [
    {
      name: 'All',
      component: () => (
        <LazyScreen component={() => import('../../src/screens/materials/AllMaterialsScreen')} />
      ),
    },
    {
      name: 'Recyclable',
      component: () => (
        <LazyScreen component={() => import('../../src/screens/materials/RecyclableScreen')} />
      ),
    },
    {
      name: 'Non-Recyclable',
      component: () => (
        <LazyScreen component={() => import('../../src/screens/materials/NonRecyclableScreen')} />
      ),
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <MaterialTopTabs screens={screens} />
    </View>
  );
} 