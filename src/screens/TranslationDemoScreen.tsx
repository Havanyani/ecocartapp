import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TranslationDemo } from '@/components/TranslationDemo';
import i18n from '@/utils/i18n';

type RootStackParamList = {
  TranslationDemo: undefined;
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, 'TranslationDemo'>;

export function TranslationDemoScreen({ navigation }: Props) {
  // Set up navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: i18n.t('settings.language'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#fff',
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TranslationDemo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default TranslationDemoScreen; 