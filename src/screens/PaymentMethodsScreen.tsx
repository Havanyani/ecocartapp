import {
    IconSymbol,
    LoadingSpinner,
    ThemedText,
    ThemedView
} from '@/components/ui';
import { usePayment } from '@/hooks/usePayment';
import { useTheme } from '@/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PaymentMethodsScreen() {
  const theme = useTheme()()();
  const {
    paymentMethods,
    creditBalance,
    isLoading,
    error,
    loadPaymentMethods,
    loadCreditBalance,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    redeemCredits,
    clearError
  } = usePayment();
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
    loadCreditBalance();
  }, [loadPaymentMethods, loadCreditBalance]);

  const handleAddPaymentMethod = useCallback(async () => {
    try {
      await addPaymentMethod({
        type: 'credit_card',
        last4: '4242',
        expiryDate: '12/24',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    }
  }, [addPaymentMethod]);

  const handleRemovePaymentMethod = useCallback(async (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePaymentMethod(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method.');
            }
          }
        }
      ]
    );
  }, [removePaymentMethod]);

  const handleSetDefault = useCallback(async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default payment method.');
    }
  }, [setDefaultPaymentMethod]);

  const handleRedeemCredits = useCallback(async () => {
    if (!creditBalance || creditBalance.available < 50) {
      Alert.alert('Insufficient Credits', 'Minimum 50 credits required to redeem.');
      return;
    }

    setIsRedeeming(true);
    try {
      await redeemCredits(creditBalance.available);
      Alert.alert('Success', 'Credits redeemed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem credits. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  }, [creditBalance, redeemCredits]);

  if (isLoading) {
    return <LoadingSpinner testID="loading-spinner" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.creditsSection}>
          <ThemedText style={styles.sectionTitle}>EcoCart Credits</ThemedText>
          <View style={styles.creditDetails}>
            <View style={styles.creditItem}>
              <ThemedText style={styles.creditLabel}>Available</ThemedText>
              <ThemedText style={styles.creditAmount}>{creditBalance?.available || 0}</ThemedText>
            </View>
            <View style={styles.creditItem}>
              <ThemedText style={styles.creditLabel}>Pending</ThemedText>
              <ThemedText style={styles.creditAmount}>{creditBalance?.pending || 0}</ThemedText>
            </View>
            <View style={styles.creditItem}>
              <ThemedText style={styles.creditLabel}>Lifetime Earned</ThemedText>
              <ThemedText style={styles.creditAmount}>{creditBalance?.lifetimeEarned || 0}</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.redeemButton,
              (!creditBalance || creditBalance.available < 50) && styles.redeemButtonDisabled
            ]}
            onPress={handleRedeemCredits}
            disabled={!creditBalance || creditBalance.available < 50 || isRedeeming}
            accessibilityLabel="Redeem credits"
            testID="redeem-credits-button"
          >
            <ThemedText style={styles.redeemButtonText}>
              {isRedeeming ? 'Redeeming...' : 'Redeem Credits'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.paymentMethodsSection}>
          <ThemedText style={styles.sectionTitle}>Payment Methods</ThemedText>
          {paymentMethods.map(method => (
            <View key={method.id} style={styles.paymentMethod}>
              <IconSymbol
                name={
                  method.type === 'credit_card' ? 'credit-card' :
                  method.type === 'debit_card' ? 'card' : 'bank'
                }
                size={24}
                color={theme.colors.text}
              />
              <View style={styles.paymentMethodDetails}>
                <ThemedText style={styles.paymentMethodTitle}>
                  {method.type === 'bank_account' ? method.bankName : `•••• ${method.last4}`}
                </ThemedText>
                {method.expiryDate && (
                  <ThemedText style={styles.paymentMethodSubtitle}>
                    Expires {method.expiryDate}
                  </ThemedText>
                )}
              </View>
              <View style={styles.paymentMethodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(method.id)}
                    accessibilityLabel="Set as default payment method"
                    testID={`set-default-${method.id}`}
                  >
                    <ThemedText style={styles.defaultText}>Set Default</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleRemovePaymentMethod(method.id)}
                  accessibilityLabel="Remove payment method"
                  testID={`remove-payment-${method.id}`}
                >
                  <IconSymbol name="trash-can" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
            accessibilityLabel="Add payment method"
            testID="add-payment-button"
          >
            <IconSymbol name="plus" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.addButtonText}>Add Payment Method</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  creditsSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  paymentMethodsSection: {
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creditItem: {
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  creditAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultText: {
    color: '#2196F3',
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCCCCC',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
  },
}); 