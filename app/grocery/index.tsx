/**
 * Grocery Section Main Screen
 * 
 * Provides navigation to grocery store integration features including
 * connected stores, orders, and credit redemption.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CreditsService } from '@/services/CreditsService';
import { GroceryIntegrationService } from '@/services/GroceryIntegrationService';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Navigation card interface
interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  primary?: boolean;
}

export default function GroceryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [connectedStores, setConnectedStores] = useState(0);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load stats in parallel
      const [stores, credits, orders] = await Promise.all([
        GroceryIntegrationService.getInstance().getConnectedStores(),
        CreditsService.getInstance().getUserCredits(),
        GroceryIntegrationService.getInstance().getOrders(10)
      ]);
      
      setConnectedStores(stores.length);
      setAvailableCredits(credits);
      
      // Count pending orders
      const pending = orders.filter(order => 
        order.status !== 'delivered' && 
        order.status !== 'cancelled' &&
        order.status !== 'refunded'
      ).length;
      
      setPendingOrders(pending);
    } catch (error) {
      console.error('Failed to load grocery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation cards for grocery features
  const navigationCards: NavigationCard[] = [
    {
      title: 'Connect Stores',
      description: 'Connect to grocery delivery services to use your eco-credits',
      icon: 'link',
      route: '/grocery/connect',
      primary: connectedStores === 0
    },
    {
      title: 'My Orders',
      description: 'View and track your grocery orders',
      icon: 'shopping-bag',
      route: '/grocery/orders',
      primary: connectedStores > 0 && pendingOrders > 0
    },
    {
      title: 'Redeem Credits',
      description: 'Use your recycling credits for grocery discounts',
      icon: 'award',
      route: '/grocery/redeem-credits',
      primary: availableCredits > 0 && connectedStores > 0
    }
  ];

  const renderNavigationCards = () => {
    return navigationCards.map((card, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.card,
          card.primary && { borderColor: theme.colors.primary }
        ]}
        onPress={() => router.push(card.route)}
      >
        <View style={styles.cardIconContainer}>
          <IconSymbol 
            name={card.icon} 
            size={32} 
            color={card.primary ? theme.colors.primary : theme.colors.secondary} 
          />
        </View>
        
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{card.title}</ThemedText>
          <ThemedText style={styles.cardDescription}>{card.description}</ThemedText>
        </View>
        
        <IconSymbol name="chevron-right" size={24} color={theme.colors.secondary} />
      </TouchableOpacity>
    ));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Grocery Integration',
          headerLargeTitle: true,
        }}
      />
      
      <ScrollView style={styles.container}>
        <ThemedView style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>
              Shop with Your Green Credits
            </ThemedText>
            
            <ThemedText style={styles.heroDescription}>
              Connect to grocery delivery services and use your earned 
              eco-credits for discounts on your purchases.
            </ThemedText>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  ${availableCredits.toFixed(2)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Available Credits
                </ThemedText>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {connectedStores}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Connected Stores
                </ThemedText>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {pendingOrders}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Pending Orders
                </ThemedText>
              </View>
            </View>
          </View>
          
          <Image 
            source={require('@/assets/images/grocery/grocery-hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </ThemedView>
        
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Features</ThemedText>
          {renderNavigationCards()}
        </View>
        
        <ThemedView style={styles.benefitsSection}>
          <ThemedText style={styles.benefitsTitle}>
            Benefits of Grocery Integration
          </ThemedText>
          
          <View style={styles.benefitItem}>
            <IconSymbol name="dollar-sign" size={24} color={theme.colors.success || '#4CAF50'} />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Save Money</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                Apply your eco-credits directly to grocery orders for immediate savings
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <IconSymbol name="leaf" size={24} color={theme.colors.success || '#4CAF50'} />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Eco-Friendly Delivery</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                Automatically choose eco-friendly delivery options to reduce your carbon footprint
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <IconSymbol name="trending-up" size={24} color={theme.colors.success || '#4CAF50'} />
            <View style={styles.benefitContent}>
              <ThemedText style={styles.benefitTitle}>Track Your Impact</ThemedText>
              <ThemedText style={styles.benefitDescription}>
                See the environmental impact of your sustainable shopping choices
              </ThemedText>
            </View>
          </View>
        </ThemedView>
        
        <ThemedView style={styles.howItWorksSection}>
          <ThemedText style={styles.howItWorksTitle}>
            How It Works
          </ThemedText>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Connect Your Accounts</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Connect to your preferred grocery delivery services
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Shop As Usual</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Continue shopping through your grocery service's app or website
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Apply Your Credits</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Use the EcoCart app to apply your credits to pending orders
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>4</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Enjoy Your Savings</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Watch your grocery bill decrease while helping the environment
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  heroContent: {
    flex: 1,
    paddingRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  heroImage: {
    width: 120,
    height: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  cardIconContainer: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  benefitsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
  },
  howItWorksSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
  },
  stepConnector: {
    width: 1,
    height: 24,
    backgroundColor: '#4CAF50',
    marginLeft: 16,
    marginVertical: 4,
  },
}); 