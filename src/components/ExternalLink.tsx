import React, { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <Pressable 
      style={styles.link} 
      onPress={() => Linking.openURL(href)}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginVertical: 8,
  },
}); 