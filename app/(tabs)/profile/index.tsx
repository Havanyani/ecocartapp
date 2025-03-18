import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <Card>
          <View style={{ alignItems: 'center', gap: theme.spacing.md }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="h2">Guest User</Text>
              <Text variant="body" style={{ color: theme.colors.textSecondary }}>
                Sign in to access all features
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Account</Text>
          <Link href="/auth/login" asChild>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Ionicons name="log-in" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">Sign In</Text>
                  <Text variant="caption">Access your account</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
              </View>
            </Card>
          </Link>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Settings</Text>
          <Link href="/profile/settings" asChild>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Ionicons name="settings" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">App Settings</Text>
                  <Text variant="caption">Customize your experience</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
              </View>
            </Card>
          </Link>
          <Link href="/profile/notifications" asChild>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Ionicons name="notifications" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">Notifications</Text>
                  <Text variant="caption">Manage your notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
              </View>
            </Card>
          </Link>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Support</Text>
          <Link href="/profile/help" asChild>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">Help & Support</Text>
                  <Text variant="caption">Get assistance and FAQs</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
              </View>
            </Card>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 