import ARContainerScanner, { RecognizedContainer } from '@/components/ar/ARContainerScanner';
import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Screen for AR container scanning feature
 */
export default function ARContainerScanScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedContainers, setScannedContainers] = useState<RecognizedContainer[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle container recognition
  const handleContainerRecognized = (container: RecognizedContainer) => {
    // Add the container to history
    setScannedContainers(prev => [container, ...prev]);
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render scan history item
  const renderHistoryItem = (container: RecognizedContainer, index: number) => (
    <View 
      key={`${container.id}-${index}`}
      style={[styles.historyItem, { backgroundColor: theme.colors.cardBackground }]}
    >
      <View style={styles.historyItemContent}>
        <MaterialCommunityIcons 
          name={container.isRecyclable ? 'recycle' : 'close-circle'} 
          size={24} 
          color={container.isRecyclable ? theme.colors.success : theme.colors.error} 
        />
        <View style={styles.historyItemTextContainer}>
          <Text style={[styles.historyItemTitle, { color: theme.colors.text }]}>
            {container.name}
          </Text>
          <Text style={[styles.historyItemSubtitle, { color: theme.colors.textSecondary }]}>
            {container.material} • {Math.round(container.confidence * 100)}% confidence
          </Text>
        </View>
      </View>
      <Text style={[styles.historyItemTime, { color: theme.colors.textSecondary }]}>
        {formatTimestamp(new Date())}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {!scannerActive && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              AR Container Scanner
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.introContainer}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name="barcode-scan" size={40} color="white" />
              </View>
              <Text style={[styles.introTitle, { color: theme.colors.text }]}>
                Scan Recycling Containers
              </Text>
              <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
                Position your camera over any recycling container to identify its type and recyclability.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setScannerActive(true)}
            >
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>

            <View style={styles.historyContainer}>
              <TouchableOpacity 
                style={styles.historyHeader}
                onPress={() => setShowHistory(!showHistory)}
              >
                <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
                  Recent Scans
                </Text>
                <MaterialCommunityIcons 
                  name={showHistory ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>

              {showHistory && (
                <View style={styles.historyList}>
                  {scannedContainers.length === 0 ? (
                    <Text style={[styles.noHistoryText, { color: theme.colors.textSecondary }]}>
                      No scan history yet. Start scanning containers!
                    </Text>
                  ) : (
                    scannedContainers.map(renderHistoryItem)
                  )}
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {scannerActive && (
        <ARContainerScanner 
          onContainerRecognized={handleContainerRecognized}
          onClose={() => setScannerActive(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyContainer: {
    flex: 1,
    marginTop: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    padding: 12,
    borderRadius: 8,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  historyItemTime: {
    fontSize: 12,
  },
  noHistoryText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 