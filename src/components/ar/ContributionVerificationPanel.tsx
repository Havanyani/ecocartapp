import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ContainerContribution, getPendingContributions, verifyContribution } from '../../services/MaterialsContributionService';

interface ContributionVerificationPanelProps {
  userId: string;
  onClose?: () => void;
}

/**
 * Panel for users to verify container contributions from other users
 */
export function ContributionVerificationPanel({
  userId,
  onClose,
}: ContributionVerificationPanelProps) {
  const theme = useTheme();
  const [pendingContributions, setPendingContributions] = useState<ContainerContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load pending contributions on mount
  useEffect(() => {
    loadPendingContributions();
  }, []);

  // Load pending contributions
  const loadPendingContributions = async () => {
    try {
      setLoading(true);
      // Exclude user's own contributions
      const contributions = await getPendingContributions(userId);
      setPendingContributions(contributions);
    } catch (error) {
      console.error('Error loading pending contributions:', error);
      Alert.alert('Error', 'Failed to load contributions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingContributions();
  };

  // Handle verification
  const handleVerify = async (contributionId: string) => {
    if (verifying) return;

    try {
      setVerifying(true);
      const result = await verifyContribution(contributionId, userId);
      
      if (result.success) {
        // Update local state
        setPendingContributions(prevContributions => {
          // If contribution was auto-approved (enough verifications), remove it
          if (result.message.includes('approved')) {
            return prevContributions.filter(c => c.id !== contributionId);
          }
          
          // Otherwise update verification count
          return prevContributions.map(c => {
            if (c.id === contributionId) {
              return { ...c, verificationCount: c.verificationCount + 1 };
            }
            return c;
          });
        });
        
        // Show success message
        Alert.alert(
          'Thank You!',
          result.message.includes('approved')
            ? 'This contribution has been approved and added to our database!'
            : 'Your verification has been recorded. Thank you for contributing!'
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to verify contribution.');
      }
    } catch (error) {
      console.error('Error verifying contribution:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Render contribution item
  const renderContributionItem = ({ item }: { item: ContainerContribution }) => (
    <View style={styles.contributionItem}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.contributionImage}
        resizeMode="cover"
      />
      
      <View style={styles.contributionDetails}>
        <Text style={styles.contributionName}>{item.containerName}</Text>
        <Text style={styles.contributionMaterial}>Material: {item.material}</Text>
        
        <View style={styles.recyclableStatus}>
          <MaterialCommunityIcons
            name={item.isRecyclable ? 'recycle' : 'close-circle'}
            size={16}
            color={item.isRecyclable ? theme.colors.success : theme.colors.error}
          />
          <Text style={[
            styles.recyclableText,
            { color: item.isRecyclable ? theme.colors.success : theme.colors.error }
          ]}>
            {item.isRecyclable ? 'Recyclable' : 'Not Recyclable'}
          </Text>
        </View>
        
        {item.description ? (
          <Text style={styles.contributionDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.verificationStatus}>
          <Text style={styles.verificationText}>
            Verifications: {item.verificationCount}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.verifyButton,
              verifying && styles.disabledButton
            ]}
            onPress={() => handleVerify(item.id)}
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={16} color={theme.colors.white} />
                <Text style={styles.verifyButtonText}>Verify</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="clipboard-check-outline"
        size={60}
        color={theme.colors.grey}
      />
      <Text style={styles.emptyTitle}>No Pending Contributions</Text>
      <Text style={styles.emptyText}>
        There are currently no contributions that need verification.
        Check back later as users add new containers!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Contributions</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.description}>
        Help verify container information submitted by other users.
        Your verification improves our database accuracy!
      </Text>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading contributions...</Text>
        </View>
      ) : (
        <FlatList
          data={pendingContributions}
          renderItem={renderContributionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  closeButton: {
    padding: 4,
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
  contributionItem: {
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
  contributionImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  contributionDetails: {
    flex: 1,
    padding: 12,
  },
  contributionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contributionMaterial: {
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
  contributionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  verificationStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  verificationText: {
    fontSize: 13,
    color: '#666',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.6,
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
}); 