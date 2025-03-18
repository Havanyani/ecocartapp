import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ARContainerRecognitionService } from '@/services/ARContainerRecognitionService';
import { ContainerInfoOverlayProps, ContainerType } from '@/types/ar';

// Helper function to get container type name in a readable format
function getContainerTypeName(type: ContainerType): string {
  switch (type) {
    case ContainerType.PLASTIC_BOTTLE:
      return 'Plastic Bottle';
    case ContainerType.GLASS_BOTTLE:
      return 'Glass Bottle';
    case ContainerType.ALUMINUM_CAN:
      return 'Aluminum Can';
    case ContainerType.CARDBOARD_BOX:
      return 'Cardboard Box';
    case ContainerType.PLASTIC_BAG:
      return 'Plastic Bag';
    case ContainerType.OTHER:
      return 'Other Container';
    default:
      return 'Unknown Container';
  }
}

// Helper function to get container icon
function getContainerIcon(type: ContainerType): React.ReactNode {
  const size = 32;
  const color = '#4CAF50';

  switch (type) {
    case ContainerType.PLASTIC_BOTTLE:
      return <MaterialCommunityIcons name="bottle-soda" size={size} color={color} />;
    case ContainerType.GLASS_BOTTLE:
      return <MaterialCommunityIcons name="bottle-wine" size={size} color={color} />;
    case ContainerType.ALUMINUM_CAN:
      return <MaterialCommunityIcons name="food-variant" size={size} color={color} />;
    case ContainerType.CARDBOARD_BOX:
      return <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />;
    case ContainerType.PLASTIC_BAG:
      return <MaterialCommunityIcons name="shopping" size={size} color={color} />;
    default:
      return <MaterialCommunityIcons name="recycle" size={size} color={color} />;
  }
}

export default function ContainerInfoOverlay({ 
  container, 
  onClose 
}: ContainerInfoOverlayProps) {
  const recognitionService = useRef<ARContainerRecognitionService>(
    ARContainerRecognitionService.getInstance()
  );
  
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate the environmental impact of this container
  const environmentalImpact = recognitionService.current.calculateEnvironmentalImpact(container);

  // Animate overlay in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  // Handle close animation and callback
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {getContainerIcon(container.type)}
            <View style={styles.headerText}>
              <Text style={styles.title}>{getContainerTypeName(container.type)}</Text>
              <Text style={styles.subtitle}>
                {Math.round(container.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <MaterialIcons name="close" size={24} color="#777" />
          </TouchableOpacity>
        </View>

        {container.imageUri && (
          <Image 
            source={{ uri: container.imageUri }} 
            style={styles.containerImage} 
            resizeMode="contain"
          />
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Container Details</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="straighten" size={20} color="#555" />
            <Text style={styles.infoLabel}>Dimensions:</Text>
            <Text style={styles.infoValue}>
              {Math.round(container.dimensions.width)}×{Math.round(container.dimensions.height)} px
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="local-drink" size={20} color="#555" />
            <Text style={styles.infoLabel}>Estimated Capacity:</Text>
            <Text style={styles.infoValue}>
              {container.estimatedCapacity.toFixed(2)} L
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="fitness-center" size={20} color="#555" />
            <Text style={styles.infoLabel}>Estimated Weight:</Text>
            <Text style={styles.infoValue}>
              {container.estimatedWeight.toFixed(1)} g
            </Text>
          </View>
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="molecule-co2" size={24} color="#4CAF50" />
              <Text style={styles.impactValue}>
                {environmentalImpact.carbonFootprintSaved.toFixed(1)}g
              </Text>
              <Text style={styles.impactLabel}>CO₂ Saved</Text>
            </View>
            
            <View style={styles.impactItem}>
              <Ionicons name="water" size={24} color="#2196F3" />
              <Text style={styles.impactValue}>
                {environmentalImpact.waterSaved.toFixed(1)}L
              </Text>
              <Text style={styles.impactLabel}>Water Saved</Text>
            </View>
            
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFC107" />
              <Text style={styles.impactValue}>
                {environmentalImpact.energySaved.toFixed(2)}kWh
              </Text>
              <Text style={styles.impactLabel}>Energy Saved</Text>
            </View>
            
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.impactValue}>
                {environmentalImpact.recyclingCredits}
              </Text>
              <Text style={styles.impactLabel}>EcoCredits</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
          <Text style={styles.actionButtonText}>Add to Recycling</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 5,
  },
  containerImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  impactSection: {
    marginBottom: 20,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 