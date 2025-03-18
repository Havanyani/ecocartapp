/**
 * CollectionDetailScreen.tsx
 * 
 * Screen for displaying detailed information about a scheduled collection,
 * including status updates, collection notes, and actions.
 */

import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Collection, CollectionStatus } from '@/types/Collection';

interface CollectionDetailScreenProps {
  route: { params: { collectionId: string } };
  navigation: any;
}

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId } = route.params;
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { theme } = useTheme();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch collection details
  useEffect(() => {
    fetchCollectionDetails();
  }, []);
  
  const fetchCollectionDetails = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call with timeout
      setTimeout(() => {
        const mockCollection: Collection = {
          id: collectionId,
          materialType: 'Plastic',
          estimatedWeight: '3.5',
          address: '123 Green Street, Eco City, EC 12345',
          scheduledDateTime: new Date(2023, 6, 15, 10, 30),
          status: 'confirmed',
          notes: 'Mostly PET bottles and some HDPE containers. Please make sure all items are clean and dry.',
          createdAt: new Date(2023, 6, 10),
          statusHistory: [
            { status: 'pending', timestamp: new Date(2023, 6, 10, 14, 25), note: 'Collection requested' },
            { status: 'confirmed', timestamp: new Date(2023, 6, 11, 9, 15), note: 'Collection confirmed by EcoCart team' }
          ],
          collectorInfo: {
            name: 'John Green',
            contactNumber: '+1 (555) 123-4567',
            vehicleInfo: 'White Ford Transit - EC-123'
          }
        };
        
        setCollection(mockCollection);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching collection details:', error);
      setIsLoading(false);
      
      // Show error alert
      Alert.alert(
        'Error',
        'Failed to load collection details. Please try again.',
        [
          {
            text: 'Retry',
            onPress: fetchCollectionDetails
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    }
  };
  
  // Update collection status
  const updateCollectionStatus = async (newStatus: CollectionStatus) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to update collection status. Your changes will be synced when you reconnect.',
        [{ text: 'OK' }]
      );
    }
    
    setIsUpdating(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call with timeout
      setTimeout(() => {
        if (collection) {
          const updatedCollection = { 
            ...collection,
            status: newStatus,
            statusHistory: [
              ...collection.statusHistory || [],
              {
                status: newStatus,
                timestamp: new Date(),
                note: `Status updated to ${newStatus}`
              }
            ]
          };
          
          setCollection(updatedCollection);
          setIsUpdating(false);
          
          // Show success message
          Alert.alert('Success', `Collection status updated to ${newStatus}`);
        }
      }, 1000);
    } catch (error) {
      console.error('Error updating collection status:', error);
      setIsUpdating(false);
      
      // Show error alert
      Alert.alert('Error', 'Failed to update collection status. Please try again.');
    }
  };
  
  // Cancel collection
  const handleCancelCollection = () => {
    Alert.alert(
      'Cancel Collection',
      'Are you sure you want to cancel this collection? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => updateCollectionStatus('cancelled')
        }
      ]
    );
  };
  
  // Complete collection
  const handleCompleteCollection = () => {
    Alert.alert(
      'Complete Collection',
      'Mark this collection as completed?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Complete',
          onPress: () => updateCollectionStatus('completed')
        }
      ]
    );
  };
  
  // Share collection details
  const handleShareCollection = async () => {
    if (!collection) return;
    
    try {
      const shareMessage = `
Collection Details:
Material: ${collection.materialType}
Weight: ${collection.estimatedWeight} kg
Date: ${format(collection.scheduledDateTime, 'PPP')}
Time: ${format(collection.scheduledDateTime, 'p')}
Address: ${collection.address}
Status: ${collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
      `;
      
      await Share.share({
        message: shareMessage,
        title: 'EcoCart Collection Details'
      });
    } catch (error) {
      console.error('Error sharing collection details:', error);
    }
  };
  
  // Get status color
  const getStatusColor = (status: CollectionStatus): string => {
    switch (status) {
      case 'pending':
        return '#FF9500'; // Orange
      case 'confirmed':
        return '#34C759'; // Green
      case 'completed':
        return '#2C76E5'; // Blue
      case 'cancelled':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading collection details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show message if collection not found
  if (!collection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Collection Not Found</Text>
          <Text style={styles.errorText}>The requested collection could not be found.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header with Status */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Collection Details</Text>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(collection.status) }
            ]}
          >
            <Text style={styles.statusText}>
              {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {/* Main Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="cube-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Material Type</Text>
              <Text style={styles.infoValue}>{collection.materialType}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="scale-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estimated Weight</Text>
              <Text style={styles.infoValue}>{collection.estimatedWeight} kg</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Collection Date</Text>
              <Text style={styles.infoValue}>
                {format(collection.scheduledDateTime, 'PPP')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Collection Time</Text>
              <Text style={styles.infoValue}>
                {format(collection.scheduledDateTime, 'p')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Collection Address</Text>
              <Text style={styles.infoValue}>{collection.address}</Text>
            </View>
          </View>
          
          {collection.notes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="document-text-outline" size={24} color="#34C759" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{collection.notes}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Collector Info Card (only if confirmed or completed) */}
        {collection.collectorInfo && ['confirmed', 'completed'].includes(collection.status) && (
          <View style={styles.collectorCard}>
            <Text style={styles.sectionTitle}>Collector Information</Text>
            
            <View style={styles.collectorInfo}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person-outline" size={24} color="#2C76E5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Collector Name</Text>
                  <Text style={styles.infoValue}>{collection.collectorInfo.name}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call-outline" size={24} color="#2C76E5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Contact Number</Text>
                  <TouchableOpacity>
                    <Text style={[styles.infoValue, styles.phoneLink]}>
                      {collection.collectorInfo.contactNumber}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {collection.collectorInfo.vehicleInfo && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="car-outline" size={24} color="#2C76E5" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Vehicle Information</Text>
                    <Text style={styles.infoValue}>{collection.collectorInfo.vehicleInfo}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Status History */}
        {collection.statusHistory && collection.statusHistory.length > 0 && (
          <View style={styles.statusHistoryCard}>
            <Text style={styles.sectionTitle}>Status History</Text>
            
            <View style={styles.statusTimeline}>
              {collection.statusHistory.map((statusItem, index) => (
                <View key={index} style={styles.statusTimelineItem}>
                  <View 
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(statusItem.status) }
                    ]} 
                  />
                  <View style={styles.statusTimelineContent}>
                    <View style={styles.statusTimelineHeader}>
                      <Text style={styles.statusTimelineStatus}>
                        {statusItem.status.charAt(0).toUpperCase() + statusItem.status.slice(1)}
                      </Text>
                      <Text style={styles.statusTimelineDate}>
                        {format(statusItem.timestamp, 'PPp')}
                      </Text>
                    </View>
                    {statusItem.note && (
                      <Text style={styles.statusTimelineNote}>{statusItem.note}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Cancel Button (only if pending or confirmed) */}
          {['pending', 'confirmed'].includes(collection.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelCollection}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Cancel Collection</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {/* Complete Button (only if confirmed) */}
          {collection.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleCompleteCollection}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Mark as Completed</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {/* Share Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareCollection}
            disabled={isUpdating}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24
  },
  backButton: {
    backgroundColor: '#2C76E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  header: {
    marginBottom: 24
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },
  offlineText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3FFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500'
  },
  phoneLink: {
    color: '#2C76E5',
    textDecorationLine: 'underline'
  },
  collectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16
  },
  collectorInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12
  },
  statusHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  statusTimeline: {
    padding: 8
  },
  statusTimelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative'
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 4
  },
  statusTimelineContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12
  },
  statusTimelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  statusTimelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50'
  },
  statusTimelineDate: {
    fontSize: 14,
    color: '#8E8E93'
  },
  statusTimelineNote: {
    fontSize: 14,
    color: '#2C3E50'
  },
  actionsContainer: {
    marginBottom: 24
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  cancelButton: {
    backgroundColor: '#FF3B30'
  },
  completeButton: {
    backgroundColor: '#34C759'
  },
  shareButton: {
    backgroundColor: '#2C76E5'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  }
}); 