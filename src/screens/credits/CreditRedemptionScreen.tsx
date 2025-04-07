import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCredits } from '../../contexts/CreditsContext';
import { useTheme } from '../../contexts/ThemeContext';

export const CreditRedemptionScreen = ({ navigation }: any) => {
  const { credits, redeemCredits, isLoading, error } = useCredits();
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const stores = [
    { id: 'store1', name: 'Checkers Sixty60' },
    { id: 'store2', name: 'Woolworths' },
    { id: 'store3', name: 'Pick n Pay' }
  ];

  const handleRedeem = async () => {
    if (!selectedStore) {
      Alert.alert('Error', 'Please select a store');
      return;
    }

    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (creditAmount > credits) {
      Alert.alert('Error', 'Insufficient credits');
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await redeemCredits(creditAmount, selectedStore);
      Alert.alert('Success', 'Credits redeemed successfully');
      navigation.goBack();
    } catch (error) {
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Failed to redeem credits');
    }
  };

  const renderStoreButton = (store: { id: string; name: string }) => (
    <TouchableOpacity
      key={store.id}
      style={[
        styles.storeButton,
        selectedStore === store.id && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => {
        setSelectedStore(store.id);
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync();
        }
      }}
    >
      <Text
        style={[
          styles.storeButtonText,
          selectedStore === store.id && { color: theme.colors.white }
        ]}
      >
        {store.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Redeem Credits
            </Text>
            <Text style={[styles.creditsText, { color: theme.colors.text }]}>
              Available Credits: {credits}
            </Text>
          </View>

          <View style={styles.storeSelection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select Store
            </Text>
            <View style={styles.storeButtons}>
              {stores.map(renderStoreButton)}
            </View>
          </View>

          <View style={styles.amountInput}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Enter Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount to redeem"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.redeemButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={handleRedeem}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.redeemButtonText}>Redeem Credits</Text>
            )}
          </TouchableOpacity>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 18,
  },
  storeSelection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  storeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  storeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountInput: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  redeemButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
}); 