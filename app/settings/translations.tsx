import { TranslationDemo } from '@/components/TranslationDemo';
import i18n from '@/utils/i18n';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TranslationsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: i18n.t('settings.language'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <TranslationDemo />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 