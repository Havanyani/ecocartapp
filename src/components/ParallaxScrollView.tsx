import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface ParallaxScrollViewProps {
  children: ReactNode;
  headerBackgroundColor: {
    light: string;
    dark: string;
  };
  headerImage?: ReactNode;
}

export default function ParallaxScrollView({ 
  children, 
  headerBackgroundColor, 
  headerImage 
}: ParallaxScrollViewProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor.light }]}>
        {headerImage}
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  content: {
    padding: 16,
  },
}); 