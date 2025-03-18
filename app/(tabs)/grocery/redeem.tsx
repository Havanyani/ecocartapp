import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CreditService } from '@/services/CreditService';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user ID for now - in a real app, this would come from auth service
const MOCK_USER_ID = 'user123';

export default function CreditRedemptionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [error, setError] = useState('');
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load credit balance
      const credits = await CreditService.getUserCredits(MOCK_USER_ID);
      setCreditBalance(credits);
      
      // Check if integration is enabled
      const settings = groceryIntegrationService.getSettings();
      setIsIntegrationEnabled(settings.enabled);
      
      if (!settings.enabled) {
        router.push('/settings/grocery-integration');
      }
    } catch (error) {
      console.error('Error loading credit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCredits = async () => {
    const amount = parseFloat(redeemAmount);
    
    // Validate input
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount > creditBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    
    try {
      setIsRedeeming(true);
      setError('');
      
      // Use credits
      const success = await CreditService.useCredits(MOCK_USER_ID, amount);
      
      if (success) {
        // Update local credit balance
        const newBalance = await CreditService.getUserCredits(MOCK_USER_ID);
        setCreditBalance(newBalance);
        
        // Show success message
        Alert.alert(
          'Credits Redeemed',
          `R${amount.toFixed(2)} has been added to your Checkers Sixty60 account.`,
          [
            { 
              text: 'View Voucher', 
              onPress: () => router.push('/grocery/voucher')
            },
            {
              text: 'Back to Orders',
              onPress: () => router.push('/grocery'),
              style: 'cancel',
            },
          ]
        );
        
        // Reset input
        setRedeemAmount('');
      } else {
        setError('Failed to redeem credits. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming credits:', error);
      setError('Failed to redeem credits. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading credit data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Redeem Credits</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <Card style={styles.balanceCard}>
          <ThemedText style={styles.balanceTitle}>Available Balance</ThemedText>
          <ThemedText style={styles.balanceAmount}>
            R {creditBalance.toFixed(2)}
          </ThemedText>
        </Card>
        
        <Card style={styles.redeemCard}>
          <ThemedText style={styles.cardTitle}>Redeem for Checkers Sixty60</ThemedText>
          <ThemedText style={styles.cardDescription}>
            Convert your recycling credits into vouchers for your Checkers Sixty60 orders.
            Enter the amount you want to redeem.
          </ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Amount (R)</ThemedText>
            <View style={styles.amountInputWrapper}>
              <ThemedText style={styles.currencySymbol}>R</ThemedText>
              <TextInput
                style={[styles.amountInput, { color: theme.colors.text.primary }]}
                value={redeemAmount}
                onChangeText={text => {
                  setRedeemAmount(text);
                  setError('');
                }}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>
            
            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
          </View>
          
          <View style={styles.quickAmountContainer}>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setRedeemAmount('50')}
            >
              <ThemedText style={styles.quickAmountText}>R50</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setRedeemAmount('100')}
            >
              <ThemedText style={styles.quickAmountText}>R100</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setRedeemAmount('200')}
            >
              <ThemedText style={styles.quickAmountText}>R200</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAmountButton}
              onPress={() => setRedeemAmount(creditBalance.toString())}
            >
              <ThemedText style={styles.quickAmountText}>All</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.redeemButtonContainer}>
            <Button 
              onPress={handleRedeemCredits}
              isLoading={isRedeeming}
              disabled={!redeemAmount || parseFloat(redeemAmount) <= 0 || parseFloat(redeemAmount) > creditBalance}
            >
              Redeem Credits
            </Button>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>
            <Ionicons name="information-circle-outline" size={16} /> How it works
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Redeem your EcoCart credits for Checkers Sixty60 vouchers
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Credits are transferred instantly to your connected account
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Use your credits to pay for groceries or delivery fees
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Minimum redemption amount: R20
          </ThemedText>
        </Card>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceCard: {
    padding: 16,
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  redeemCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  quickAmountText: {
    fontSize: 14,
  },
  redeemButtonContainer: {
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    marginBottom: 8,
  },
}); 