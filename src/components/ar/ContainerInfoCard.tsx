import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecognizedContainer } from './ARContainerScanner';

interface ContainerInfoCardProps {
  container: RecognizedContainer;
  onAddToCollection?: () => void;
  onViewDetails?: () => void;
}

/**
 * Displays information about a recognized recycling container
 */
export default function ContainerInfoCard({
  container,
  onAddToCollection,
  onViewDetails,
}: ContainerInfoCardProps) {
  const { theme } = useTheme();
  
  // Format confidence percentage
  const confidencePercentage = Math.round(container.confidence * 100);
  
  // Determine recyclability status color
  const getStatusColor = () => {
    if (container.isRecyclable) {
      return theme.colors.success || '#00C853';
    }
    return theme.colors.error || '#D32F2F';
  };
  
  // Get recyclability text
  const recyclabilityText = container.isRecyclable
    ? 'Recyclable'
    : 'Not Recyclable';

  // Format environmental impact data
  const formatImpact = (value: number | undefined, unit: string): string => {
    if (value === undefined || value === 0) return 'N/A';
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {container.name}
        </Text>
        <View style={[styles.confidenceBadge, { backgroundColor: theme.colors.secondary }]}>
          <Text style={[styles.confidenceText, { color: theme.colors.textInverse }]}>
            {confidencePercentage}% confidence
          </Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Material:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{container.material}</Text>
      </View>
      
      {container.materialType && (
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type:</Text>
          <View style={[styles.materialBadge, { backgroundColor: theme.colors.primary + '30' }]}>
            <Text style={[styles.materialText, { color: theme.colors.primary }]}>
              {container.materialType}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{recyclabilityText}</Text>
        </View>
      </View>
      
      {container.recycleCodes && container.recycleCodes.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Recycle Code:</Text>
          <View style={styles.codeContainer}>
            {container.recycleCodes.map((code, index) => (
              <View 
                key={code} 
                style={[styles.codeBadge, { backgroundColor: theme.colors.secondary + '20' }]}
              >
                <Text style={[styles.codeText, { color: theme.colors.secondary }]}>
                  {code}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {container.environmentalImpact && (
        <View style={styles.impactContainer}>
          <Text style={[styles.impactTitle, { color: theme.colors.textSecondary }]}>
            Environmental Impact When Recycled
          </Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={[styles.impactValue, { color: theme.colors.success }]}>
                {formatImpact(container.environmentalImpact.carbonFootprintSaved, 'kg')}
              </Text>
              <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                CO₂ Saved
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactValue, { color: theme.colors.info || theme.colors.primary }]}>
                {formatImpact(container.environmentalImpact.waterSaved, 'L')}
              </Text>
              <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                Water Saved
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactValue, { color: theme.colors.warning || '#FF9800' }]}>
                {formatImpact(container.environmentalImpact.energySaved, 'kWh')}
              </Text>
              <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                Energy Saved
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {container.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsLabel, { color: theme.colors.textSecondary }]}>
            Recycling Instructions:
          </Text>
          <Text style={[styles.instructions, { color: theme.colors.text }]}>
            {container.instructions}
          </Text>
        </View>
      )}
      
      <View style={styles.actions}>
        {onAddToCollection && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={onAddToCollection}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
              Add to Collection
            </Text>
          </TouchableOpacity>
        )}
        
        {onViewDetails && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={onViewDetails}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
              View Details
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    width: 80,
  },
  value: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  materialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  materialText: {
    fontSize: 14,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  codeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  impactContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  impactLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
}); 