/**
 * app/(tabs)/index.tsx
 * 
 * Home screen for the EcoCart app.
 */

import { Todo } from '@/components/Todo';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../src/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleViewAllTasks = () => {
    router.push('/collection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/eco-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>EcoCart</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            Recycling made rewarding
          </Text>
        </View>

        <View style={styles.todoContainer}>
          <Todo 
            type="collection" 
            maxItems={3} 
            onViewAll={handleViewAllTasks}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Welcome to EcoCart
          </Text>
          <Text style={[styles.cardText, { color: colors.text }]}>
            Schedule your plastic waste collection alongside grocery deliveries and earn rewards for contributing to a greener planet.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={[styles.featureCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.featureTitle, { color: colors.tint }]}>Schedule Collection</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Easily schedule plastic waste collection with a few taps.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.featureTitle, { color: colors.tint }]}>Earn Credits</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Earn credits based on the weight and type of materials you recycle.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.featureTitle, { color: colors.tint }]}>Redeem Rewards</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Use your earned credits for discounts on future purchases.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  todoContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
