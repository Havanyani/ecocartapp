import { useTheme } from '@/hooks/useTheme';
import { MaterialsContributionService } from '@/services/MaterialsContributionService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface ContainerData {
  id?: string;
  name: string;
  type: string;
  material: string;
  weight?: number;
  size?: string;
  imageUri?: string;
  recyclable: boolean;
  ecoPoints?: number;
  notes?: string;
}

interface ContributionFormProps {
  containerData: ContainerData;
  imageUri?: string;
  onSubmitSuccess?: (points: number) => void;
  onCancel?: () => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  containerData,
  imageUri,
  onSubmitSuccess,
  onCancel
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const [quantity, setQuantity] = useState<string>('1');
  const [condition, setCondition] = useState<string>('good');
  const [notes, setNotes] = useState<string>(containerData.notes || '');
  const [location, setLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [totalPoints, setTotalPoints] = useState<number>(containerData.ecoPoints || 10);
  
  useEffect(() => {
    // Calculate points based on quantity and condition
    const basePoints = containerData.ecoPoints || 10;
    const quantityNum = parseInt(quantity, 10) || 1;
    
    let conditionMultiplier = 1;
    switch (condition) {
      case 'excellent':
        conditionMultiplier = 1.2;
        break;
      case 'good':
        conditionMultiplier = 1.0;
        break;
      case 'fair':
        conditionMultiplier = 0.8;
        break;
      case 'poor':
        conditionMultiplier = 0.5;
        break;
      default:
        conditionMultiplier = 1;
    }
    
    setTotalPoints(Math.round(basePoints * quantityNum * conditionMultiplier));
  }, [quantity, condition, containerData.ecoPoints]);
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const contributionData = {
        container: {
          id: containerData.id,
          name: containerData.name,
          type: containerData.type,
          material: containerData.material,
          weight: containerData.weight,
          size: containerData.size,
          recyclable: containerData.recyclable
        },
        quantity: parseInt(quantity, 10) || 1,
        condition,
        notes,
        location,
        imageUri,
        ecoPoints: totalPoints,
        timestamp: new Date().toISOString()
      };
      
      const contributionService = new MaterialsContributionService();
      const result = await contributionService.submitContribution(contributionData);
      
      setIsSubmitting(false);
      
      if (result.success) {
        // Show success feedback
        if (onSubmitSuccess) {
          onSubmitSuccess(totalPoints);
        } else {
          Alert.alert(
            'Contribution Successful!',
            `Thank you for recycling! You've earned ${totalPoints} EcoPoints.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('HomeScreen')
              }
            ]
          );
        }
      } else {
        Alert.alert('Submission Error', result.message || 'Failed to submit contribution');
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', 'An unexpected error occurred while submitting your contribution');
      console.error('Contribution submission error:', error);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Recycling Contribution
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onCancel}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.containerInfo}>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.containerImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.containerImage, { backgroundColor: theme.colors.border }]}>
                <Ionicons name="image-outline" size={40} color={theme.colors.secondaryText} />
              </View>
            )}
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.containerName, { color: theme.colors.text }]}>
              {containerData.name}
            </Text>
            <Text style={[styles.containerType, { color: theme.colors.secondaryText }]}>
              {containerData.type} • {containerData.material}
            </Text>
            
            {containerData.weight && (
              <Text style={[styles.containerDetail, { color: theme.colors.secondaryText }]}>
                Weight: {containerData.weight}g
              </Text>
            )}
            
            {containerData.size && (
              <Text style={[styles.containerDetail, { color: theme.colors.secondaryText }]}>
                Size: {containerData.size}
              </Text>
            )}
            
            <View style={styles.recyclableStatus}>
              <Ionicons 
                name={containerData.recyclable ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={containerData.recyclable ? theme.colors.success : theme.colors.error} 
              />
              <Text 
                style={[
                  styles.recyclableText, 
                  { 
                    color: containerData.recyclable 
                      ? theme.colors.success 
                      : theme.colors.error 
                  }
                ]}
              >
                {containerData.recyclable ? 'Recyclable' : 'Not Recyclable'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contribution Details
          </Text>
          
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Quantity
            </Text>
            <TextInput
              style={[
                styles.textInput, 
                { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }
              ]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="Enter quantity"
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Condition
            </Text>
            <View style={styles.conditionOptions}>
              {['excellent', 'good', 'fair', 'poor'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.conditionOption,
                    { 
                      backgroundColor: condition === option 
                        ? theme.colors.primaryLight
                        : theme.colors.card,
                      borderColor: condition === option 
                        ? theme.colors.primary
                        : theme.colors.border
                    }
                  ]}
                  onPress={() => setCondition(option)}
                >
                  <Text 
                    style={{ 
                      color: condition === option 
                        ? theme.colors.primary
                        : theme.colors.text
                    }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Location (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInput, 
                { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }
              ]}
              value={location}
              onChangeText={setLocation}
              placeholder="Where are you recycling this?"
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInputMultiline, 
                { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional information about this container"
              placeholderTextColor={theme.colors.secondaryText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={[styles.pointsCard, { backgroundColor: theme.colors.successLight }]}>
          <Ionicons 
            name="trophy-outline" 
            size={24} 
            color={theme.colors.success} 
            style={styles.pointsIcon}
          />
          <View style={styles.pointsInfo}>
            <Text style={[styles.pointsLabel, { color: theme.colors.success }]}>
              EcoPoints for this contribution
            </Text>
            <Text style={[styles.pointsValue, { color: theme.colors.success }]}>
              +{totalPoints} points
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={{ color: theme.colors.text }}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { backgroundColor: theme.colors.primary },
            isSubmitting && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.white} />
              <Text style={[styles.submitButtonText, { color: theme.colors.white }]}>
                Submit
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  containerInfo: {
    flexDirection: 'row',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  imageContainer: {
    marginRight: 16,
  },
  containerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  containerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  containerType: {
    fontSize: 14,
    marginBottom: 8,
  },
  containerDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  recyclableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recyclableText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  textInputMultiline: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
  },
  conditionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  pointsIcon: {
    marginRight: 12,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 