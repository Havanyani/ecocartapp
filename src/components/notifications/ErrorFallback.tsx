import React from 'react';
import { Text, View } from 'react-native';
import { IconButton } from './IconButton';
import { baseStyles, errorStyles } from './styles';
import type { ErrorFallbackProps } from './types';

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <View style={[baseStyles.container, errorStyles.container]}>
      <Text style={errorStyles.text}>
        {error.message || 'Something went wrong displaying the alert'}
      </Text>
      <IconButton 
        name="refresh"
        onPress={resetErrorBoundary}
        testID="error-retry"
        size={24}
      />
    </View>
  );
} 