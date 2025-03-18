import { ThemedText } from '@components/ui/ThemedText';
import React from 'react';
import { View } from 'react-native';

interface DeliveryNotificationProps {
  delivery: {
    id: string;
    status: string;
    estimatedTime: string;
    driverName: string;
    hasPlasticCollection: boolean;
  };
}

export function DeliveryNotification({ delivery }: DeliveryNotificationProps) {
  return (
    <View>
      <ThemedText>Arriving at {delivery.estimatedTime}</ThemedText>
      <ThemedText>{delivery.driverName}</ThemedText>
      {delivery.hasPlasticCollection && (
        <ThemedText>Please have your plastic waste ready</ThemedText>
      )}
    </View>
  );
}