/**
 * Credit Redemption Screen
 * 
 * Allows users to apply their available eco-credits to grocery orders
 * as a discount on their purchase.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { GroceryIntegrationService } from '@/services/GroceryIntegrationService';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

export default function RedeemCreditsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ orderId: string; storeId: string; maxCredits: string }>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [maxCredits, setMaxCredits] = useState(0);
  const [creditsToApply, setCreditsToApply] = useState(0);
  
  useEffect(() => {
    if (!params.orderId || !params.storeId) {
      Alert.alert('Error', 'Missing order information');
      router.back();
      return;
    }
    
    loadOrderDetails();
    
    // Parse maxCredits from params or default to 0
    const availableCredits = params.maxCredits ? parseFloat(params.maxCredits) : 0;
    setMaxCredits(availableCredits);
    
    // Default to 50% of max credits or full order amount (whichever is smaller)
    setCreditsToApply(Math.min(availableCredits / 2, orderDetails?.total || 0));
  }, [params.orderId, params.storeId]);
  
  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      if (!params.orderId || !params.storeId) return;
      
      // Get single order details
      const order = await GroceryIntegrationService.getInstance().getOrderById(
        params.storeId,
        params.orderId
      );
      
      setOrderDetails(order);
      
      // Cap credits to apply at order total
      if (order && maxCredits > order.total) {
        setMaxCredits(order.total);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSliderChange = (value: number) => {
    // Round to 2 decimal places
    setCreditsToApply(Math.round(value * 100) / 100);
  };
  
  const handleInputChange = (text: string) => {
    const value = parseFloat(text);
    if (isNaN(value)) {
      setCreditsToApply(0);
      return;
    }
    
    // Clamp value between 0 and maxCredits (or order total)
    const maxAllowed = Math.min(maxCredits, orderDetails?.total || 0);
    const clampedValue = Math.max(0, Math.min(value, maxAllowed));
    setCreditsToApply(clampedValue);
  };
  
  const handleApplyCredits = async () => {
    if (creditsToApply <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a credit amount greater than zero.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await GroceryIntegrationService.getInstance().redeemCredits({
        storeId: params.storeId,
        orderId: params.orderId,
        amount: creditsToApply,
      });
      
      if (result.success) {
        Alert.alert(
          'Credits Applied',
          `You've successfully applied $${creditsToApply.toFixed(2)} in credits to your order.`,
          [{ text: 'OK', onPress: () => router.push('/grocery/orders') }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to apply credits to your order');
      }
    } catch (error) {
      console.error('Failed to apply credits:', error);
      Alert.alert('Error', 'Failed to apply credits to your order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Redeem Eco-Credits',
          headerBackTitle: 'Back',
        }}
      />
      
      <View style={styles.container}>
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="award" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Apply Credits to Order</ThemedText>
          </View>
          
          {orderDetails && (
            <View style={styles.orderInfo}>
              <ThemedText style={styles.orderTitle}>
                Order #{orderDetails.id.slice(-6)} from {orderDetails.provider}
              </ThemedText>
              
              <View style={styles.orderDetail}>
                <ThemedText style={styles.label}>Order Total:</ThemedText>
                <ThemedText style={styles.value}>${orderDetails.total.toFixed(2)}</ThemedText>
              </View>
              
              {orderDetails.creditsApplied > 0 && (
                <View style={styles.orderDetail}>
                  <ThemedText style={styles.label}>Credits Already Applied:</ThemedText>
                  <ThemedText style={styles.value}>${orderDetails.creditsApplied.toFixed(2)}</ThemedText>
                </View>
              )}
              
              <View style={styles.orderDetail}>
                <ThemedText style={styles.label}>Your Available Credits:</ThemedText>
                <ThemedText style={styles.valueHighlight}>${maxCredits.toFixed(2)}</ThemedText>
              </View>
            </View>
          )}
          
          <View style={styles.creditsInputContainer}>
            <ThemedText style={styles.inputLabel}>Amount to Apply:</ThemedText>
            
            <View style={styles.inputRow}>
              <ThemedText style={styles.currencySymbol}>$</ThemedText>
              <Input
                value={creditsToApply.toString()}
                onChangeText={handleInputChange}
                keyboardType="numeric"
                style={styles.creditsInput}
              />
            </View>
            
            <Slider
              value={creditsToApply}
              minimumValue={0}
              maximumValue={Math.min(maxCredits, orderDetails?.total || 0)}
              step={0.01}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.divider}
              thumbTintColor={theme.colors.primary}
              style={styles.slider}
            />
            
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>$0</ThemedText>
              <ThemedText style={styles.sliderLabel}>
                ${Math.min(maxCredits, orderDetails?.total || 0).toFixed(2)}
              </ThemedText>
            </View>
            
            {orderDetails && (
              <View style={styles.summaryContainer}>
                <ThemedText style={styles.summaryLabel}>Order Summary</ThemedText>
                
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryItem}>Order Total</ThemedText>
                  <ThemedText style={styles.summaryValue}>${orderDetails.total.toFixed(2)}</ThemedText>
                </View>
                
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryItem}>Credits to Apply</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.colors.primary }]}>
                    -${creditsToApply.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryTotal}>New Order Total</ThemedText>
                  <ThemedText style={styles.summaryTotalValue}>
                    ${(orderDetails.total - creditsToApply).toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <IconSymbol name="info" size={16} color={theme.colors.info || '#2196F3'} />
            <ThemedText style={styles.infoText}>
              Credits are non-refundable once applied to an order. You'll still earn EcoPoints on the full value of your purchase.
            </ThemedText>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            
            <Button
              onPress={handleApplyCredits}
              disabled={creditsToApply <= 0 || isSubmitting}
              loading={isSubmitting}
              style={styles.applyButton}
            >
              Apply Credits
            </Button>
          </View>
        </ThemedView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  orderInfo: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  creditsInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  creditsInput: {
    flex: 1,
    fontSize: 18,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#888',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
}); 