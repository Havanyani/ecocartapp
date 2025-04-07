import { useTheme } from '@/theme';
import { createShadow } from '@/utils/styleUtils';
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
  const themeFunc = useTheme();
  const theme = themeFunc();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
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
          fgColor={theme.colors.text}
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
    ...createShadow({
      offsetY: 2,
      opacity: 0.1,
      radius: 4,
      elevation: 3
    }),
  },
}); 