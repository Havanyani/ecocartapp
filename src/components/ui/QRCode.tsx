import { useTheme } from '@/hooks/useTheme';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

interface QRCodeProps {
  value: string;
  size?: number;
  title?: string;
}

export function QRCodeComponent({ value, size = 200, title }: QRCodeProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
      )}
      <View style={[styles.qrContainer, { backgroundColor: theme.colors.background }]}>
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin
          bgColor={theme.colors.background}
          fgColor={theme.colors.text.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 