/**
 * WebView Screen
 * 
 * A generic WebView component to display external web content
 * such as order tracking pages and receipts.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ url: string; title: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Ensure we have a URL to load
  if (!params.url) {
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: params.title || 'Web View',
          headerRight: () => (
            <IconSymbol
              name="x"
              size={24}
              color={theme.colors.primary}
              onPress={() => router.back()}
              style={styles.closeButton}
            />
          ),
        }}
      />

      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        <WebView
          source={{ uri: params.url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  closeButton: {
    padding: 8,
  },
}); 