import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import {
    ContainerContribution,
    contributionToContainerType,
    getPendingContributions,
    rejectContribution
} from '../services/MaterialsContributionService';

/**
 * Admin screen for managing the materials database
 * This includes reviewing contributions, managing existing materials, and more
 */
export function AdminMaterialsDatabaseScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  
  // State variables
  const [pendingContributions, setPendingContributions] = useState<ContainerContribution[]>([]);
  const [approvedMaterials, setApprovedMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedContributionId, setSelectedContributionId] = useState<string | null>(null);
  const [filterRecyclable, setFilterRecyclable] = useState<boolean | null>(null);
  
  // Load data on mount
  useEffect(() => {
    loadPendingContributions();
  }, []);
  
  // Load pending contributions
  const loadPendingContributions = async () => {
    try {
      setLoading(true);
      const contributions = await getPendingContributions();
      setPendingContributions(contributions);
      
      // Get approved materials by filtering the contributions
      const approved = contributions
        .filter(c => c.status === 'approved')
        .map(c => contributionToContainerType(c.id))
        .filter(Boolean);
        
      setApprovedMaterials(approved);
    } catch (error) {
      console.error('Error loading contributions:', error);
      Alert.alert('Error', 'Failed to load contributions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle contribution approval
  const handleApprove = async (contributionId: string) => {
    try {
      // In a real app, we'd call an API to approve the contribution
      // For now, we'll just update our local state
      
      // Find the contribution
      const contribution = pendingContributions.find(c => c.id === contributionId);
      if (!contribution) return;
      
      // Create a container type from the contribution
      const containerType = contributionToContainerType(contributionId);
      if (!containerType) {
        Alert.alert('Error', 'Failed to convert contribution to container type');
        return;
      }
      
      // Update state
      setPendingContributions(prev => 
        prev.map(c => c.id === contributionId ? {...c, status: 'approved'} : c)
      );
      
      setApprovedMaterials(prev => [...prev, containerType]);
      
      Alert.alert(
        'Success', 
        `${contribution.containerName} has been approved and added to the database.`
      );
    } catch (error) {
      console.error('Error approving contribution:', error);
      Alert.alert('Error', 'Failed to approve contribution. Please try again.');
    }
  };
  
  // Open rejection modal
  const openRejectModal = (contributionId: string) => {
    setSelectedContributionId(contributionId);
    setRejectionReason('');
    setRejectionModalVisible(true);
  };
  
  // Handle contribution rejection
  const handleReject = async () => {
    if (!selectedContributionId || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection.');
      return;
    }
    
    try {
      // Call rejection service
      const result = await rejectContribution(
        selectedContributionId, 
        'admin', // Admin user ID
        rejectionReason.trim()
      );
      
      if (result.success) {
        // Update state
        setPendingContributions(prev => 
          prev.map(c => c.id === selectedContributionId ? 
            {...c, status: 'rejected', rejectionReason: rejectionReason.trim()} : c
          )
        );
        
        // Close modal and reset
        setRejectionModalVisible(false);
        setSelectedContributionId(null);
        setRejectionReason('');
        
        Alert.alert('Success', 'Contribution has been rejected.');
      } else {
        Alert.alert('Error', result.message || 'Failed to reject contribution.');
      }
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      Alert.alert('Error', 'Failed to reject contribution. Please try again.');
    }
  };
  
  // Filter materials based on search query and recyclable status
  const filteredMaterials = () => {
    let filtered = activeTab === 'pending' ? pendingContributions : approvedMaterials;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const name = activeTab === 'pending' ? item.containerName : item.name;
        const material = activeTab === 'pending' ? item.material : item.material;
        
        return (
          name.toLowerCase().includes(query) ||
          material.toLowerCase().includes(query)
        );
      });
    }
    
    // Filter by recyclable status
    if (filterRecyclable !== null) {
      filtered = filtered.filter(item => 
        activeTab === 'pending' 
          ? item.isRecyclable === filterRecyclable
          : item.isRecyclable === filterRecyclable
      );
    }
    
    return filtered;
  };
  
  // Render contribution item
  const renderContributionItem = ({ item }: { item: ContainerContribution }) => (
    <View style={styles.itemContainer}>
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.containerName}</Text>
        <Text style={styles.itemMaterial}>Material: {item.material}</Text>
        
        <View style={styles.recyclableStatus}>
          <MaterialCommunityIcons
            name={item.isRecyclable ? 'recycle' : 'close-circle'}
            size={16}
            color={item.isRecyclable ? theme.colors.success : theme.colors.error}
          />
          <Text style={{
            ...styles.recyclableText,
            color: item.isRecyclable ? theme.colors.success : theme.colors.error
          }}>
            {item.isRecyclable ? 'Recyclable' : 'Not Recyclable'}
          </Text>
        </View>
        
        <Text style={styles.verificationCount}>
          Verifications: {item.verificationCount}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => openRejectModal(item.id)}
          >
            <MaterialCommunityIcons name="close" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Render approved material item
  const renderApprovedMaterialItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMaterial}>Material: {item.material}</Text>
        
        <View style={styles.recyclableStatus}>
          <MaterialCommunityIcons
            name={item.isRecyclable ? 'recycle' : 'close-circle'}
            size={16}
            color={item.isRecyclable ? theme.colors.success : theme.colors.error}
          />
          <Text style={{
            ...styles.recyclableText,
            color: item.isRecyclable ? theme.colors.success : theme.colors.error
          }}>
            {item.isRecyclable ? 'Recyclable' : 'Not Recyclable'}
          </Text>
        </View>
        
        {item.instructions && (
          <Text style={styles.instructions} numberOfLines={2}>
            {item.instructions}
          </Text>
        )}
      </View>
    </View>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name={activeTab === 'pending' ? 'clipboard-check-outline' : 'database-outline'}
        size={60}
        color={theme.colors.grey}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending' ? 'No Pending Contributions' : 'No Materials Found'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'pending' 
          ? 'There are currently no contributions that need review.'
          : 'No materials match your search criteria.'
        }
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Materials Database</Text>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'pending' && styles.activeTab
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'pending' && styles.activeTabText
          ]}>
            Pending ({pendingContributions.filter(c => c.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'approved' && styles.activeTab
          ]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'approved' && styles.activeTabText
          ]}>
            Approved ({approvedMaterials.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === 'pending' ? 'contributions' : 'materials'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterRecyclable === true && styles.activeFilterButton
            ]}
            onPress={() => setFilterRecyclable(
              filterRecyclable === true ? null : true
            )}
          >
            <MaterialCommunityIcons 
              name="recycle" 
              size={16} 
              color={filterRecyclable === true ? "#fff" : theme.colors.success} 
            />
            <Text style={[
              styles.filterButtonText,
              filterRecyclable === true && styles.activeFilterButtonText
            ]}>
              Recyclable
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterRecyclable === false && styles.activeFilterButton
            ]}
            onPress={() => setFilterRecyclable(
              filterRecyclable === false ? null : false
            )}
          >
            <MaterialCommunityIcons 
              name="close-circle" 
              size={16} 
              color={filterRecyclable === false ? "#fff" : theme.colors.error} 
            />
            <Text style={[
              styles.filterButtonText,
              filterRecyclable === false && styles.activeFilterButtonText
            ]}>
              Non-Recyclable
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading {activeTab === 'pending' ? 'contributions' : 'materials'}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMaterials()}
          keyExtractor={item => item.id}
          renderItem={activeTab === 'pending' ? renderContributionItem : renderApprovedMaterialItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* Rejection Modal */}
      <Modal
        visible={rejectionModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Contribution</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this contribution:
            </Text>
            
            <TextInput
              style={styles.rejectionInput}
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRejectionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleReject}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 100,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemMaterial: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  recyclableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recyclableText: {
    fontSize: 14,
    marginLeft: 4,
  },
  verificationCount: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#999',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 