import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoucherScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { amount = '100.00' } = useLocalSearchParams<{ amount: string }>();
  
  // Generate a random voucher code
  const voucherCode = 'ECO' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const dateExpires = new Date();
  dateExpires.setDate(dateExpires.getDate() + 30); // Expires in 30 days
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Your Voucher</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <Card style={styles.voucherCard}>
          <ThemedView style={styles.voucherHeader}>
            <ThemedText style={styles.voucherTitle}>Checkers Sixty60</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.voucherBody}>
            <ThemedText style={styles.voucherAmount}>
              R {parseFloat(amount).toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.voucherLabel}>
              RECYCLING CREDIT VOUCHER
            </ThemedText>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={`ECOCART:VOUCHER:${voucherCode}:${amount}`}
                size={180}
                color={theme.colors.text.primary}
                backgroundColor="white"
              />
            </View>
            
            <ThemedText style={styles.voucherCode}>{voucherCode}</ThemedText>
            
            <View style={styles.validityContainer}>
              <ThemedText style={styles.validityText}>
                Valid until: {formatDate(dateExpires)}
              </ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView style={styles.instructionsContainer}>
            <ThemedText style={styles.instructionsTitle}>
              How to Use
            </ThemedText>
            <ThemedText style={styles.instructionsText}>
              1. When checking out on Checkers Sixty60 app, tap "Add Voucher"
            </ThemedText>
            <ThemedText style={styles.instructionsText}>
              2. Enter the voucher code or scan the QR code
            </ThemedText>
            <ThemedText style={styles.instructionsText}>
              3. The voucher amount will be applied to your purchase
            </ThemedText>
          </ThemedView>
        </Card>
        
        <View style={styles.buttonRow}>
          <Button
            onPress={() => router.push('/grocery')}
            style={styles.button}
          >
            Back to Grocery
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              // In a real app, this would share the voucher
              alert('Share functionality would be implemented here');
            }}
            style={styles.button}
          >
            <Ionicons name="share-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
            Share
          </Button>
        </View>
      </ThemedView>
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
  voucherCard: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  voucherHeader: {
    padding: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  voucherBody: {
    padding: 24,
    alignItems: 'center',
  },
  voucherAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  voucherLabel: {
    fontSize: 14,
    marginBottom: 24,
    opacity: 0.7,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  validityContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  validityText: {
    fontSize: 14,
    opacity: 0.7,
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 