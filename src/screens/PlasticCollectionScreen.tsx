import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCollectionSchedule } from '@/hooks/useCollectionSchedule';
import { useCredits } from '@/hooks/useCredits';
import { useNotifications } from '@/hooks/useNotifications';

export function PlasticCollectionScreen(): JSX.Element {
  const { scheduleCollection, cancelCollection, refreshSchedule } = useCollectionSchedule();
  const { updateCredits } = useCredits();
  const { scheduleReminder } = useNotifications();

  return (
    <View testID="plastic-collection-screen">
      <Text>Plastic Collection</Text>
      <TouchableOpacity onPress={() => scheduleCollection({ id: '1', date: '2024-03-20', timeSlot: '14:00-16:00' })}>
        <Text>Schedule Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => cancelCollection('1')}>
        <Text>Cancel Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={refreshSchedule}>
        <Text>Refresh Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => updateCredits(100)}>
        <Text>Update Credits</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => scheduleReminder('2024-03-20', '14:00')}>
        <Text>Schedule Reminder</Text>
      </TouchableOpacity>
    </View>
  );
} 