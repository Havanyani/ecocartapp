import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="leaf" size={24} color={theme.colors.primary} />
            <Text variant="h2">Welcome to EcoCart</Text>
          </View>
          <Text variant="body" style={{ marginTop: theme.spacing.sm }}>
            Start your recycling journey by exploring materials and scheduling collections.
          </Text>
        </Card>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Link href="/materials" asChild style={{ flex: 1 }}>
              <Card>
                <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                  <Ionicons name="search" size={24} color={theme.colors.primary} />
                  <Text variant="subtitle">Find Materials</Text>
                </View>
              </Card>
            </Link>
            <Link href="/collection/schedule" asChild style={{ flex: 1 }}>
              <Card>
                <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                  <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                  <Text variant="subtitle">Schedule Pickup</Text>
                </View>
              </Card>
            </Link>
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Recent Activity</Text>
          <Card>
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="time" size={24} color={theme.colors.primary} />
                <View>
                  <Text variant="subtitle">No recent activity</Text>
                  <Text variant="caption">Start recycling to see your activity</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Environmental Impact</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Card style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons name="leaf" size={24} color={theme.colors.success} />
                <Text variant="h3">0 kg</Text>
                <Text variant="caption">Carbon Saved</Text>
              </View>
            </Card>
            <Card style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons name="water" size={24} color={theme.colors.info} />
                <Text variant="h3">0 L</Text>
                <Text variant="caption">Water Saved</Text>
              </View>
            </Card>
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Tips & Guides</Text>
          <Card>
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="bulb" size={24} color={theme.colors.warning} />
                <View>
                  <Text variant="subtitle">Recycling Tips</Text>
                  <Text variant="caption">Learn how to recycle effectively</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 