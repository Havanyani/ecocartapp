import { ARContainerScanner } from '@/components/ar/ARContainerScanner';
import { useTheme } from '@/hooks/useTheme';
import { MaterialDetectionResult, VolumeEstimationResult } from '@/utils/material-detection';
import { formatVolume } from '@/utils/volume-estimation';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ARContainerScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [scanResult, setScanResult] = useState<{
    material: MaterialDetectionResult;
    volume: VolumeEstimationResult;
    environmentalImpact: {
      carbonFootprintSaved: number;
      waterSaved: number;
      energySaved: number;
      landfillSpaceSaved: number;
    };
  } | null>(null);

  const handleContainerRecognized = (result: {
    material: MaterialDetectionResult;
    volume: VolumeEstimationResult;
    environmentalImpact: {
      carbonFootprintSaved: number;
      waterSaved: number;
      energySaved: number;
      landfillSpaceSaved: number;
    };
  }) => {
    setScanResult(result);
  };

  const handleClose = () => {
    router.back();
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    const { material, volume, environmentalImpact } = scanResult;

    return (
      <View style={[styles.resultContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <ScrollView style={styles.resultScroll}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
            Scan Results
          </Text>

          <View style={styles.resultSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Material
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              {material.material}
            </Text>
            <Text style={[styles.confidenceText, { color: theme.colors.text }]}>
              Confidence: {(material.confidence * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.recyclableText, { color: material.isRecyclable ? theme.colors.success : theme.colors.error }]}>
              {material.isRecyclable ? 'Recyclable' : 'Not Recyclable'}
            </Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Volume
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              {formatVolume(volume.volume, volume.unit)}
            </Text>
            <Text style={[styles.confidenceText, { color: theme.colors.text }]}>
              Confidence: {(volume.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Environmental Impact
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              Carbon Footprint Saved: {environmentalImpact.carbonFootprintSaved.toFixed(1)} kg CO2
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              Water Saved: {environmentalImpact.waterSaved.toFixed(1)} L
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              Energy Saved: {environmentalImpact.energySaved.toFixed(1)} kWh
            </Text>
            <Text style={[styles.resultText, { color: theme.colors.text }]}>
              Landfill Space Saved: {environmentalImpact.landfillSpaceSaved.toFixed(1)} m³
            </Text>
          </View>

          {material.instructions && (
            <View style={styles.resultSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recycling Instructions
              </Text>
              <Text style={[styles.resultText, { color: theme.colors.text }]}>
                {material.instructions}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // TODO: Save scan result
              router.back();
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              Save Result
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleClose}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {scanResult ? (
        renderScanResult()
      ) : (
        <ARContainerScanner
          onContainerRecognized={handleContainerRecognized}
          onClose={handleClose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultScroll: {
    flex: 1,
    padding: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  recyclableText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 