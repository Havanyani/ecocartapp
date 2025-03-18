import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h2">Collection Schedule</Text>
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            Schedule pickups and view your collection history
          </Text>
        </View>

        <Link href="/collection/schedule" asChild>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                <Text variant="subtitle">Schedule a Pickup</Text>
                <Text variant="body" style={{ color: theme.colors.text.secondary }}>
                  Choose materials and set a convenient time
                </Text>
              </View>
              <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            </View>
          </Card>
        </Link>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Upcoming Collections</Text>
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <View>
                  <Text variant="subtitle">No upcoming collections</Text>
                  <Text variant="caption">Schedule a pickup to get started</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        <Link href="/collection/history" asChild>
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="time" size={24} color={theme.colors.primary} />
                <View>
                  <Text variant="subtitle">Collection History</Text>
                  <Text variant="caption">View past collections and earnings</Text>
                </View>
              </View>
            </View>
          </Card>
        </Link>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Collection Stats</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Card style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons name="cube" size={24} color={theme.colors.primary} />
                <Text variant="h3">0 kg</Text>
                <Text variant="caption">Total Collected</Text>
              </View>
            </Card>
            <Card style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons name="leaf" size={24} color={theme.colors.success} />
                <Text variant="h3">0 kg</Text>
                <Text variant="caption">CO₂ Saved</Text>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 