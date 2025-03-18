import { ThemedView } from '@components/ui/ThemedView';
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface PerformanceMetricsLayoutProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

export function PerformanceMetricsLayout({
  header,
  footer,
  children,
  isLoading,
  isEmpty,
  loadingComponent,
  emptyComponent,
}: PerformanceMetricsLayoutProps) {
  const renderContent = () => {
    if (isLoading && loadingComponent) {
      return loadingComponent;
    }

    if (isEmpty && emptyComponent) {
      return emptyComponent;
    }

    return children;
  };

  return (
    <ThemedView style={styles.container}>
      {header && <View style={styles.header}>{header}</View>}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        {renderContent()}
      </ScrollView>

      {footer && <View style={styles.footer}>{footer}</View>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
}); 