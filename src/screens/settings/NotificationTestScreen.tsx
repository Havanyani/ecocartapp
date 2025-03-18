import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/components/notifications/NotificationManager';

const NotificationTestScreen: React.FC = () => {
  const notifications = useNotifications();
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState('test-collection-123');
  const [achievementId, setAchievementId] = useState('test-achievement-123');
  const [challengeId, setChallengeId] = useState('test-challenge-123');
  
  // Test collection reminder
  const testCollectionReminder = async () => {
    try {
      // Create a date 1 hour in the future
      const collectionDate = new Date();
      collectionDate.setHours(collectionDate.getHours() + 24);
      
      const notificationId = await notifications.scheduleCollectionReminder(
        collectionId,
        'Plastic Bottles',
        collectionDate,
        '123 Main Street'
      );
      
      setTestStatus(`Collection reminder scheduled: ${notificationId}`);
    } catch (error) {
      console.error('Failed to schedule collection reminder:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Test status update
  const testStatusUpdate = async () => {
    try {
      const notificationId = await notifications.sendCollectionStatusUpdate(
        collectionId,
        'Plastic Bottles',
        'confirmed'
      );
      
      setTestStatus(`Status update sent: ${notificationId}`);
    } catch (error) {
      console.error('Failed to send status update:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Test achievement notification
  const testAchievementNotification = async () => {
    try {
      const notificationId = await notifications.sendAchievementNotification(
        achievementId,
        'Eco Warrior',
        'You collected 100kg of plastic waste! Keep up the great work.'
      );
      
      setTestStatus(`Achievement notification sent: ${notificationId}`);
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Test sync notification
  const testSyncNotification = async () => {
    try {
      const notificationId = await notifications.sendSyncCompleteNotification(15);
      
      setTestStatus(`Sync notification sent: ${notificationId}`);
    } catch (error) {
      console.error('Failed to send sync notification:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Test community challenge update
  const testCommunityUpdate = async () => {
    try {
      const notificationId = await notifications.sendCommunityUpdateNotification(
        challengeId,
        'Neighborhood Cleanup',
        'Your community has made significant progress in the cleanup challenge!',
        750,
        1000
      );
      
      setTestStatus(`Community update sent: ${notificationId}`);
    } catch (error) {
      console.error('Failed to send community update:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Test challenge completion
  const testChallengeCompletion = async () => {
    try {
      const notificationId = await notifications.sendChallengeCompleteNotification(
        challengeId,
        'Beach Cleanup Challenge',
        '50 EcoCredits and a special badge'
      );
      
      setTestStatus(`Challenge completion sent: ${notificationId}`);
    } catch (error) {
      console.error('Failed to send challenge completion:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Cancel all notifications
  const cancelAllNotifications = async () => {
    try {
      await notifications.cancelAllNotifications();
      setTestStatus('All notifications cancelled');
      Alert.alert('Success', 'All scheduled notifications have been cancelled.');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Tester</Text>
          <Text style={styles.subtitle}>
            Test and preview different notification types
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Notifications</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Collection ID:</Text>
            <TextInput
              style={styles.input}
              value={collectionId}
              onChangeText={setCollectionId}
              placeholder="Enter collection ID"
            />
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={testCollectionReminder}
            >
              <MaterialIcons name="notifications-active" size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Reminder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={testStatusUpdate}
            >
              <MaterialIcons name="update" size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Status Update</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Notifications</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Achievement ID:</Text>
            <TextInput
              style={styles.input}
              value={achievementId}
              onChangeText={setAchievementId}
              placeholder="Enter achievement ID"
            />
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testAchievementNotification}
          >
            <MaterialIcons name="emoji-events" size={22} color="#FFFFFF" />
            <Text style={styles.buttonText}>Test Achievement</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Notifications</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testSyncNotification}
          >
            <MaterialIcons name="sync" size={22} color="#FFFFFF" />
            <Text style={styles.buttonText}>Test Sync Completion</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Notifications</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Challenge ID:</Text>
            <TextInput
              style={styles.input}
              value={challengeId}
              onChangeText={setChallengeId}
              placeholder="Enter challenge ID"
            />
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={testCommunityUpdate}
            >
              <MaterialIcons name="group" size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Challenge Update</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={testChallengeCompletion}
            >
              <MaterialIcons name="celebration" size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Challenge Completion</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {testStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Last Test Result:</Text>
            <Text style={styles.statusText}>{testStatus}</Text>
          </View>
        )}
        
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Cancel All Notifications',
                'Are you sure you want to cancel all scheduled notifications?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes, Cancel All', onPress: cancelAllNotifications }
                ]
              );
            }}
          >
            <MaterialIcons name="notifications-off" size={22} color="#FFFFFF" />
            <Text style={styles.buttonText}>Cancel All Notifications</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#34D399',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: '48%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#065F46',
  },
  dangerZone: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B91C1C',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default NotificationTestScreen; 