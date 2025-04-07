/**
 * EditProfileScreen.tsx
 * 
 * Screen for editing user profile information, including profile picture, 
 * personal details, and security settings.
 */

import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

interface EditProfileScreenProps {
  navigation: any;
  route: any;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  general?: string;
}

interface ExtendedUserProfile {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  profilePictureUrl?: string | null;
}

export default function EditProfileScreen({ navigation, route }: EditProfileScreenProps) {
  const { user, signOut, isBiometricEnabled, enableBiometric, disableBiometric, 
    isTwoFactorEnabled, enableTwoFactor, disableTwoFactor, isLoading, error: authError } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // Mock updateProfile function since it doesn't exist in AuthContext
  const updateProfile = async (profileData: ExtendedUserProfile) => {
    // In a real app, this would call an API to update the user profile
    // For this demo, we'll just simulate a successful update after a delay
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // This is a simplified mock implementation
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Failed to update profile'));
        }
      }, 1000);
    });
  };
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '', // Default empty since it's not in AuthUser
    bio: '',   // Default empty since it's not in AuthUser
    location: '', // Default empty since it's not in AuthUser
  });
  
  // State for form errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // State for profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // State for save button
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle form input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Bio validation (optional, but limit length if provided)
    if (formData.bio && formData.bio.length > 200) {
      errors.bio = 'Bio should be less than 200 characters';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Updates will be saved locally and synced when you\'re back online.'
      );
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Prepare the update data
      const profileData = {
        ...formData,
        profilePictureUrl: profileImage,
      };
      
      // Update the profile
      await updateProfile(profileData);
      
      // Navigate back on success
      navigation.goBack();
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle select profile picture
  const handleSelectProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library was denied');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true);
        
        // In a real app, you would upload the image to your server here
        // and get back a URL to store in the user profile
        
        // For this example, we'll just use the local URI
        setProfileImage(result.assets[0].uri);
        setIsUploadingImage(false);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      setIsUploadingImage(false);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  // Handle take photo
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access camera was denied');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true);
        
        // In a real app, you would upload the image to your server here
        // and get back a URL to store in the user profile
        
        // For this example, we'll just use the local URI
        setProfileImage(result.assets[0].uri);
        setIsUploadingImage(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setIsUploadingImage(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };
  
  // Handle remove photo
  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setProfileImage(null) }
      ]
    );
  };
  
  // Handle change profile picture
  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleSelectProfilePicture },
        profileImage ? { text: 'Remove Photo', style: 'destructive', onPress: handleRemovePhoto } : undefined,
      ].filter(Boolean) as any[]
    );
  };
  
  // Handle toggle biometric
  const handleToggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        await enableBiometric();
      } else {
        await disableBiometric();
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to change biometric settings. Please try again.');
    }
  };
  
  // Handle setup two-factor authentication
  const handleSetupTwoFactor = () => {
    if (isTwoFactorEnabled) {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive', 
            onPress: async () => {
              try {
                await disableTwoFactor();
                Alert.alert('Success', 'Two-factor authentication has been disabled.');
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to disable two-factor authentication';
                Alert.alert('Error', errorMessage);
              }
            } 
          }
        ]
      );
    } else {
      navigation.navigate('TwoFactorSetup');
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Offline Banner */}
          {!isOnline && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
              <Text style={styles.offlineText}>
                You're offline. Changes will be saved locally and synced when you're back online.
              </Text>
            </View>
          )}
          
          {/* Profile Picture */}
          <View style={styles.profileImageSection}>
            <View style={styles.profileImageContainer}>
              {isUploadingImage ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#34C759" />
                </View>
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitials}>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangeProfilePicture}
            >
              <Text style={styles.changePhotoText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>
          
          {/* Error Message */}
          {(authError || formErrors.general) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
              <Text style={styles.errorText}>
                {authError || formErrors.general}
              </Text>
            </View>
          )}
          
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.name ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="person-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={value => handleChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              {formErrors.name && (
                <Text style={styles.fieldError}>{formErrors.name}</Text>
              )}
            </View>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.email ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={value => handleChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#8E8E93"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {formErrors.email && (
                <Text style={styles.fieldError}>{formErrors.email}</Text>
              )}
            </View>
            
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={value => handleChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={value => handleChange('location', value)}
                  placeholder="Enter your location"
                  placeholderTextColor="#8E8E93"
                />
              </View>
            </View>
            
            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio (Optional)</Text>
              <View
                style={[
                  styles.textAreaContainer,
                  formErrors.bio ? styles.inputError : undefined
                ]}
              >
                <TextInput
                  style={styles.textArea}
                  value={formData.bio}
                  onChangeText={value => handleChange('bio', value)}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>
              <Text style={styles.charCount}>{formData.bio.length}/200</Text>
              {formErrors.bio && (
                <Text style={styles.fieldError}>{formErrors.bio}</Text>
              )}
            </View>
          </View>
          
          {/* Security Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
            
            {/* Biometric Authentication */}
            <View style={styles.securityOption}>
              <View style={styles.securityOptionInfo}>
                <Ionicons name="finger-print" size={24} color="#2C3E50" />
                <View style={styles.securityOptionText}>
                  <Text style={styles.securityOptionTitle}>Biometric Login</Text>
                  <Text style={styles.securityOptionDescription}>
                    {isBiometricEnabled 
                      ? 'Enabled - Login without password using fingerprint or face' 
                      : 'Login without password using fingerprint or face'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#E5E5EA', true: '#4CD964' }}
                thumbColor={isBiometricEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            {/* Two-Factor Authentication */}
            <TouchableOpacity
              style={styles.securityOption}
              onPress={handleSetupTwoFactor}
            >
              <View style={styles.securityOptionInfo}>
                <Ionicons name="shield-checkmark" size={24} color="#2C3E50" />
                <View style={styles.securityOptionText}>
                  <Text style={styles.securityOptionTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.securityOptionDescription}>
                    {isTwoFactorEnabled 
                      ? 'Enabled - Extra security for your account' 
                      : 'Set up extra security for your account'}
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#8E8E93" 
              />
            </TouchableOpacity>
            
            {/* Change Password */}
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.securityOptionInfo}>
                <Ionicons name="lock-closed" size={24} color="#2C3E50" />
                <View style={styles.securityOptionText}>
                  <Text style={styles.securityOptionTitle}>Change Password</Text>
                  <Text style={styles.securityOptionDescription}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#8E8E93" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete Account', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Account Deletion', 'This feature is not implemented in this demo.') 
                  }
                ]
              )}
            >
              <Ionicons name="trash-bin" size={20} color="#FFFFFF" />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  offlineText: {
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F8F8F8',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  fieldError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  securityOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  securityOptionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  dangerSection: {
    margin: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 