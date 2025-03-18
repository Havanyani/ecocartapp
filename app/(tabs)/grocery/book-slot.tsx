import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CreditService } from '@/services/CreditService';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { DeliverySlot } from '@/types/GroceryStore';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user ID for now - in a real app, this would come from auth service
const MOCK_USER_ID = 'user123';

export default function BookSlotScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [slot, setSlot] = useState<DeliverySlot | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [useCredits, setUseCredits] = useState(true);
  
  useEffect(() => {
    if (!id) {
      router.replace('/grocery');
      return;
    }
    
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load delivery slots
      const slots = await groceryIntegrationService.getDeliverySlots();
      const foundSlot = slots.find(s => s.id === id);
      
      if (!foundSlot) {
        Alert.alert(
          'Slot Not Found',
          'The selected delivery slot could not be found.',
          [
            {
              text: 'Go Back',
              onPress: () => router.back(),
            }
          ]
        );
        return;
      }
      
      setSlot(foundSlot);
      
      // Load credit balance
      const credits = await CreditService.getUserCredits(MOCK_USER_ID);
      setCreditBalance(credits);
    } catch (error) {
      console.error('Error loading slot data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSlot = async () => {
    if (!slot) return;
    
    try {
      setIsBooking(true);
      
      // Apply credits if selected
      if (useCredits && creditBalance > 0) {
        const fee = slot.fee || 0;
        const amountToUse = Math.min(creditBalance, fee);
        await CreditService.useCredits(MOCK_USER_ID, amountToUse);
      }
      
      // Book the slot
      const success = await groceryIntegrationService.bookDeliverySlot(slot.id);
      
      if (success) {
        Alert.alert(
          'Booking Confirmed',
          'Your delivery slot has been booked successfully.',
          [
            {
              text: 'View Orders',
              onPress: () => router.push('/grocery'),
            }
          ]
        );
      } else {
        Alert.alert(
          'Booking Failed',
          'There was an error booking your delivery slot. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => handleBookSlot(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error booking slot:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, d MMMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading || !slot) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading slot details...</ThemedText>
      </ThemedView>
    );
  }

  const canApplyCredits = creditBalance > 0;
  const fee = slot.fee || 0;
  const creditsToApply = useCredits ? Math.min(creditBalance, fee) : 0;
  const remainingFee = Math.max(0, fee - creditsToApply);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Confirm Booking</ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.content}>
        <Card style={styles.slotCard}>
          <ThemedText style={styles.sectionTitle}>Delivery Details</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date</ThemedText>
            <ThemedText style={styles.detailValue}>{formatDate(slot.date)}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Time</ThemedText>
            <ThemedText style={styles.detailValue}>{slot.startTime} - {slot.endTime}</ThemedText>
          </View>
          
          {/* Only show maxOrders if available */}
          {slot.maxOrders !== undefined && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Maximum Orders</ThemedText>
              <ThemedText style={styles.detailValue}>{slot.maxOrders}</ThemedText>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Delivery Fee</ThemedText>
            <ThemedText style={styles.detailValue}>R {fee.toFixed(2)}</ThemedText>
          </View>
        </Card>
        
        {canApplyCredits && (
          <Card style={styles.creditsCard}>
            <View style={styles.creditsSwitchRow}>
              <ThemedText style={styles.creditsSwitchLabel}>Use Recycling Credits</ThemedText>
              <TouchableOpacity 
                style={[
                  styles.creditsSwitch,
                  useCredits ? styles.creditsSwitchOn : styles.creditsSwitchOff
                ]}
                onPress={() => setUseCredits(!useCredits)}
              >
                <View style={[
                  styles.creditsSwitchHandle,
                  useCredits ? styles.creditsSwitchHandleOn : styles.creditsSwitchHandleOff
                ]} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.creditsAvailable}>
              Available: R {creditBalance.toFixed(2)}
            </ThemedText>
            
            {useCredits && (
              <>
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Credits Applied</ThemedText>
                  <ThemedText style={[styles.detailValue, styles.creditsValue]}>
                    - R {creditsToApply.toFixed(2)}
                  </ThemedText>
                </View>
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Remaining Fee</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    R {remainingFee.toFixed(2)}
                  </ThemedText>
                </View>
              </>
            )}
          </Card>
        )}
        
        <Card style={styles.summaryCard}>
          <ThemedText style={styles.sectionTitle}>Payment Summary</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Delivery Fee</ThemedText>
            <ThemedText style={styles.detailValue}>R {fee.toFixed(2)}</ThemedText>
          </View>
          
          {useCredits && creditsToApply > 0 && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Credits Applied</ThemedText>
              <ThemedText style={[styles.detailValue, styles.creditsValue]}>
                - R {creditsToApply.toFixed(2)}
              </ThemedText>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, styles.totalLabel]}>Total to Pay</ThemedText>
            <ThemedText style={[styles.detailValue, styles.totalValue]}>
              R {remainingFee.toFixed(2)}
            </ThemedText>
          </View>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button 
            onPress={handleBookSlot}
            isLoading={isBooking}
          >
            Confirm Booking
          </Button>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  slotCard: {
    padding: 16,
    marginBottom: 16,
  },
  creditsCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  creditsSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditsSwitchLabel: {
    fontSize: 16,
  },
  creditsSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  creditsSwitchOn: {
    backgroundColor: '#4CAF50',
  },
  creditsSwitchOff: {
    backgroundColor: '#ccc',
  },
  creditsSwitchHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  creditsSwitchHandleOn: {
    marginLeft: 'auto',
  },
  creditsSwitchHandleOff: {
    marginLeft: 0,
  },
  creditsAvailable: {
    fontSize: 14,
    opacity: 0.7,
  },
  creditsValue: {
    color: '#4CAF50',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 1,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 32,
  },
}); 