import DateTimePicker from '@react-native-community/datetimepicker';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@/hooks/useStore';

export const CollectionScreen = observer(() => {
  const { collectionStore } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [estimatedWeight, setEstimatedWeight] = useState<number>(0);

  const handleScheduleCollection = async () => {
    if (!selectedDate || estimatedWeight <= 0) return;

    const collection = await collectionStore.scheduleCollection(
      estimatedWeight,
      selectedDate
    );

    if (collection) {
      setSelectedDate(null);
      setEstimatedWeight(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule Plastic Collection</Text>
      </View>
      <View style={styles.scheduleSection}>
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={handleScheduleCollection}
        >
          <Text style={styles.buttonText}>Schedule New Pickup</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scheduleForm}>
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          onChange={(event, date) => setSelectedDate(date)}
        />
        <TextInput
          style={styles.weightInput}
          placeholder="Estimated plastic weight (kg)"
          keyboardType="numeric"
          value={estimatedWeight.toString()}
          onChangeText={text => setEstimatedWeight(Number(text))}
        />
      </View>
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Collection History</Text>
        {/* Collection history list will go here */}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scheduleSection: {
    padding: 16,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleForm: {
    padding: 16,
    alignItems: 'center',
  },
  weightInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
}); 