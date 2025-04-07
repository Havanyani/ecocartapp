import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { submitContribution } from '../../services/MaterialsContributionService';

interface ContainerContributionFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for users to contribute new container information to the database
 */
export function ContainerContributionForm({
  userId,
  onSuccess,
  onCancel,
}: ContainerContributionFormProps) {
  const theme = useTheme();
  const [containerName, setContainerName] = useState('');
  const [material, setMaterial] = useState('');
  const [isRecyclable, setIsRecyclable] = useState(true);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const cameraRef = useRef<Camera>(null);

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission denied',
        'We need camera permissions to take photos of containers.'
      );
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission denied',
        'We need media library permissions to select photos of containers.'
      );
      return false;
    }
    return true;
  };

  // Take a photo
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      
      setImageUri(photo.uri);
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  // Open camera
  const handleCaptureImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Submit the contribution
  const handleSubmit = async () => {
    // Validate form
    if (!containerName.trim()) {
      Alert.alert('Missing Information', 'Please enter a container name.');
      return;
    }

    if (!material.trim()) {
      Alert.alert('Missing Information', 'Please enter the material type.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Missing Image', 'Please take or select a photo of the container.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContribution({
        containerName: containerName.trim(),
        material: material.trim(),
        isRecyclable,
        description: description.trim(),
        instructions: instructions.trim(),
        location: location.trim(),
        uploadedBy: userId,
        tags: [],
      }, imageUri);

      setIsSubmitting(false);

      if (result.success) {
        Alert.alert(
          'Thank You!',
          'Your contribution has been submitted for verification. It will help improve recycling information for everyone!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to submit contribution. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting contribution:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
          ratio="4:3"
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowCamera(false)}
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Contribute Container Information</Text>
        <Text style={styles.subtitle}>
          Help us improve recycling by adding this container to our database
        </Text>

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.imageRemoveButton}
                onPress={() => setImageUri(null)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-plus" size={50} color={theme.colors.primary} />
              <Text style={styles.imagePlaceholderText}>Add container image</Text>
            </View>
          )}

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={[styles.button, styles.imageButton]}
              onPress={handleCaptureImage}
            >
              <MaterialCommunityIcons name="camera" size={20} color={theme.colors.white} />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.imageButton]}
              onPress={handlePickImage}
            >
              <MaterialCommunityIcons name="image" size={20} color={theme.colors.white} />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formFields}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Container Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="E.g., Plastic Water Bottle, Glass Jar"
              placeholderTextColor={theme.colors.text + '80'}
              value={containerName}
              onChangeText={setContainerName}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Material Type *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="E.g., HDPE Plastic, Clear Glass, Aluminum"
              placeholderTextColor={theme.colors.text + '80'}
              value={material}
              onChangeText={setMaterial}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>Recyclable</Text>
            <Switch
              value={isRecyclable}
              onValueChange={setIsRecyclable}
              trackColor={{ false: theme.colors.grey, true: theme.colors.primaryLight }}
              thumbColor={isRecyclable ? theme.colors.primary : theme.colors.greyDark}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Describe the container (size, color, etc.)"
              placeholderTextColor={theme.colors.text + '80'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Recycling Instructions</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="How should this be recycled?"
              placeholderTextColor={theme.colors.text + '80'}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="City, Country or Region"
              placeholderTextColor={theme.colors.text + '80'}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.white} />
                <Text style={styles.buttonText}>Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  imageButton: {
    minWidth: 120,
  },
  formFields: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
}); 