import LoadingState from '@/components/LoadingState';
import { useTheme } from '@/hooks/useTheme';
import TutorialService, { TutorialID } from '@/services/TutorialService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TutorialItemProps {
  id: TutorialID;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isCompleted: boolean;
  onReset: (id: TutorialID) => void;
}

function TutorialItem({ 
  id, 
  name, 
  description, 
  icon, 
  isCompleted, 
  onReset 
}: TutorialItemProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.tutorialItem, { borderBottomColor: theme.colors.background }]}>
      <View style={styles.tutorialInfo}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.tutorialName, { color: theme.colors.text }]}>{name}</Text>
          <Text style={[styles.tutorialDescription, { color: theme.colors.text + '99' }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.tutorialActions}>
        <View style={styles.statusContainer}>
          <Text 
            style={[
              styles.statusText, 
              { 
                color: isCompleted ? theme.colors.success : theme.colors.text + '80'
              }
            ]}
          >
            {isCompleted ? 'Completed' : 'Not Viewed'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.resetButton, 
            { 
              backgroundColor: isCompleted ? theme.colors.primary : theme.colors.background,
              opacity: isCompleted ? 1 : 0.5 
            }
          ]}
          onPress={() => onReset(id)}
          disabled={!isCompleted}
        >
          <Text style={[
            styles.resetButtonText, 
            { color: isCompleted ? 'white' : theme.colors.text + '50' }
          ]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TutorialsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [tutorialStatus, setTutorialStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  
  // Load tutorial statuses
  useEffect(() => {
    loadTutorialStatuses();
  }, []);
  
  // Load tutorial completion statuses
  const loadTutorialStatuses = async () => {
    setIsLoading(true);
    
    try {
      // Check onboarding status
      const isOnboardingDone = await TutorialService.isOnboardingCompleted();
      setOnboardingCompleted(isOnboardingDone);
      
      // Get all completed tutorials
      const completedTutorials = await TutorialService.getCompletedTutorials();
      
      // Create a status map for each tutorial
      const statusMap: Record<string, boolean> = {};
      
      // Set status for each tutorial
      Object.values(TutorialID).forEach(id => {
        statusMap[id] = completedTutorials.includes(id as TutorialID);
      });
      
      setTutorialStatus(statusMap);
    } catch (error) {
      console.error('Failed to load tutorial statuses:', error);
      Alert.alert('Error', 'Failed to load tutorial statuses');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset a specific tutorial
  const handleResetTutorial = async (tutorialId: TutorialID) => {
    try {
      await TutorialService.resetTutorial(tutorialId);
      
      // Update state
      setTutorialStatus(prev => ({
        ...prev,
        [tutorialId]: false
      }));
      
      Alert.alert('Success', `${getTutorialDetails(tutorialId).name} tutorial has been reset.`);
    } catch (error) {
      console.error('Failed to reset tutorial:', error);
      Alert.alert('Error', 'Failed to reset tutorial');
    }
  };
  
  // Reset all tutorials
  const handleResetAllTutorials = async () => {
    Alert.alert(
      'Reset All Tutorials',
      'Are you sure you want to reset all tutorials? This will mark all tutorials as not viewed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await TutorialService.resetAllTutorials();
              
              // Update state - mark all as not completed
              const resetStatus: Record<string, boolean> = {};
              Object.values(TutorialID).forEach(id => {
                resetStatus[id] = false;
              });
              
              setTutorialStatus(resetStatus);
              
              Alert.alert('Success', 'All tutorials have been reset');
            } catch (error) {
              console.error('Failed to reset all tutorials:', error);
              Alert.alert('Error', 'Failed to reset all tutorials');
            }
          }
        }
      ]
    );
  };
  
  // Toggle onboarding completion
  const handleToggleOnboarding = async (value: boolean) => {
    try {
      if (value) {
        await TutorialService.markOnboardingCompleted();
      } else {
        await TutorialService.resetOnboarding();
      }
      
      setOnboardingCompleted(value);
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
      Alert.alert('Error', 'Failed to update onboarding status');
    }
  };
  
  // Get tutorial name and details
  const getTutorialDetails = (tutorialId: TutorialID): {
    name: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  } => {
    const tutorialDetails: Record<TutorialID, {
      name: string;
      description: string;
      icon: keyof typeof Ionicons.glyphMap;
    }> = {
      [TutorialID.WELCOME_TOUR]: {
        name: 'Welcome Tour',
        description: 'Introduction to EcoCart app features and navigation',
        icon: 'home-outline'
      },
      [TutorialID.MATERIALS_TOUR]: {
        name: 'Materials Guide',
        description: 'Learn about recyclable materials and categories',
        icon: 'leaf-outline'
      },
      [TutorialID.COLLECTION_SCHEDULING_TOUR]: {
        name: 'Collection Scheduling',
        description: 'How to schedule recycling pickups from your location',
        icon: 'calendar-outline'
      },
      [TutorialID.ANALYTICS_TOUR]: {
        name: 'Analytics Dashboard',
        description: 'Understanding your recycling impact and statistics',
        icon: 'bar-chart-outline'
      },
      [TutorialID.PROFILE_TOUR]: {
        name: 'Profile & Settings',
        description: 'Managing your account preferences and settings',
        icon: 'person-outline'
      },
      [TutorialID.OFFLINE_MODE_TOUR]: {
        name: 'Offline Mode',
        description: 'Using the app without an internet connection',
        icon: 'cloud-offline-outline'
      },
      [TutorialID.PERFORMANCE_SETTINGS_TOUR]: {
        name: 'Performance Settings',
        description: 'Optimizing app performance for your device',
        icon: 'speedometer-outline'
      },
      [TutorialID.DARK_MODE_TOUR]: {
        name: 'Theme Settings',
        description: 'Customizing app appearance and theme',
        icon: 'color-palette-outline'
      }
    };
    
    return tutorialDetails[tutorialId] || {
      name: 'Unknown Tutorial',
      description: 'No description available',
      icon: 'help-outline'
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Tutorials & Help</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingState type="list" lines={5} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              App Onboarding
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    Onboarding Completed
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                    Mark the app introduction as completed
                  </Text>
                </View>
                <Switch
                  value={onboardingCompleted}
                  onValueChange={handleToggleOnboarding}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={onboardingCompleted ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.viewOnboardingButton, { borderTopColor: theme.colors.background }]}
                onPress={() => router.push('/onboarding')}
              >
                <Text style={[styles.viewOnboardingText, { color: theme.colors.primary }]}>
                  View Onboarding
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Feature Tutorials
              </Text>
              <TouchableOpacity 
                style={[styles.resetAllButton, { borderColor: theme.colors.primary }]} 
                onPress={handleResetAllTutorials}
              >
                <Text style={[styles.resetAllButtonText, { color: theme.colors.primary }]}>
                  Reset All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              {Object.values(TutorialID).map(tutorialId => (
                <TutorialItem
                  key={tutorialId}
                  id={tutorialId}
                  isCompleted={tutorialStatus[tutorialId] || false}
                  onReset={handleResetTutorial}
                  {...getTutorialDetails(tutorialId)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  viewOnboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  viewOnboardingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  resetAllButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tutorialItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  tutorialInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  tutorialName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  tutorialActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
}); 