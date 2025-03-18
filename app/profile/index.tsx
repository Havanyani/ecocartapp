import { UserProfile } from '@/components/community/UserProfile';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * User Profile Screen
 * Displays user profile information, achievements, impact statistics,
 * and social sharing options.
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'impact' | 'achievements'>('profile');

  /**
   * Share user profile and environmental impact
   */
  const handleShareProfile = async () => {
    try {
      const result = await Share.share({
        message: "Check out my environmental impact with EcoCart! I've recycled 43kg of materials and saved 12kg of CO2 emissions.",
        url: 'https://ecocart.app/profile/12345',
        title: 'My EcoCart Profile',
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Profile
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShareProfile}
          >
            <Ionicons name="share-social-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Link href="/profile/settings" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['profile', 'impact', 'achievements'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab as 'profile' | 'impact' | 'achievements')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.colors.primary : theme.colors.text.secondary }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'profile' && (
          <View style={styles.profileSection}>
            <UserProfile 
              userId="current-user"
              showStats={true}
              showAchievements={false}
            />
            
            <View style={[styles.connectSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Connect with Friends
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                Find friends and join challenges together
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.connectButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/community/find-friends')}
                >
                  <Text style={[styles.connectButtonText, { color: theme.colors.buttonText }]}>
                    Find Friends
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.connectButton, { backgroundColor: 'transparent', borderColor: theme.colors.primary, borderWidth: 1 }]}
                  onPress={() => router.push('/profile/invite')}
                >
                  <Text style={[styles.connectButtonText, { color: theme.colors.primary }]}>
                    Invite Friends
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'impact' && (
          <View style={styles.impactSection}>
            <View style={[styles.impactCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Environmental Impact
              </Text>
              
              <View style={styles.impactStats}>
                <View style={styles.impactStatItem}>
                  <Ionicons name="leaf-outline" size={32} color={theme.colors.success} />
                  <Text style={[styles.impactValue, { color: theme.colors.success }]}>43 kg</Text>
                  <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>Materials Recycled</Text>
                </View>
                
                <View style={styles.impactStatItem}>
                  <Ionicons name="cloud-outline" size={32} color={theme.colors.info} />
                  <Text style={[styles.impactValue, { color: theme.colors.info }]}>12 kg</Text>
                  <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>CO2 Saved</Text>
                </View>
                
                <View style={styles.impactStatItem}>
                  <Ionicons name="water-outline" size={32} color="#3498db" />
                  <Text style={[styles.impactValue, { color: '#3498db' }]}>210 L</Text>
                  <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>Water Conserved</Text>
                </View>
              </View>
              
              <View style={styles.shareImpact}>
                <TouchableOpacity 
                  style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleShareProfile}
                >
                  <Ionicons name="share-social" size={20} color={theme.colors.buttonText} />
                  <Text style={[styles.shareButtonText, { color: theme.colors.buttonText }]}>
                    Share Your Impact
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.impactCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Contribution Breakdown
              </Text>
              
              <View style={styles.contributionItem}>
                <View style={styles.contributionHeader}>
                  <Text style={[styles.contributionTitle, { color: theme.colors.text.primary }]}>
                    Plastic Recycling
                  </Text>
                  <Text style={[styles.contributionValue, { color: theme.colors.success }]}>
                    18.5 kg
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: '43%', backgroundColor: theme.colors.success }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.contributionItem}>
                <View style={styles.contributionHeader}>
                  <Text style={[styles.contributionTitle, { color: theme.colors.text.primary }]}>
                    Paper Recycling
                  </Text>
                  <Text style={[styles.contributionValue, { color: theme.colors.info }]}>
                    12.3 kg
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: '28%', backgroundColor: theme.colors.info }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.contributionItem}>
                <View style={styles.contributionHeader}>
                  <Text style={[styles.contributionTitle, { color: theme.colors.text.primary }]}>
                    Glass Recycling
                  </Text>
                  <Text style={[styles.contributionValue, { color: '#9b59b6' }]}>
                    8.7 kg
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: '20%', backgroundColor: '#9b59b6' }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.contributionItem}>
                <View style={styles.contributionHeader}>
                  <Text style={[styles.contributionTitle, { color: theme.colors.text.primary }]}>
                    Metal Recycling
                  </Text>
                  <Text style={[styles.contributionValue, { color: '#e67e22' }]}>
                    3.5 kg
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: '9%', backgroundColor: '#e67e22' }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'achievements' && (
          <View style={styles.achievementsSection}>
            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Your Achievements
              </Text>
              <Text style={[styles.achievementCount, { color: theme.colors.primary }]}>
                12 of 36 unlocked
              </Text>
            </View>
            
            <UserProfile 
              userId="current-user"
              showStats={false}
              showAchievements={true}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingBottom: 20,
  },
  impactSection: {
    padding: 16,
  },
  achievementsSection: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  connectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  impactCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  impactStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  shareImpact: {
    alignItems: 'center',
    marginTop: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  contributionItem: {
    marginBottom: 16,
  },
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contributionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  contributionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
}); 