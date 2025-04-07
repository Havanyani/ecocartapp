import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ProductCard, ThemedText } from '../components/shared';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/eco-logo.png')} style={styles.logo} />
        <ThemedText style={styles.title}>EcoCart</ThemedText>
        <ThemedText variant="subtitle" style={styles.subtitle}>Sustainable Shopping</ThemedText>
      </View>
      
      <View style={styles.featuredSection}>
        <ThemedText variant="heading" style={styles.sectionTitle}>Featured Products</ThemedText>
        <View style={styles.productsRow}>
          <ProductCard 
            name="Organic Cotton T-Shirt"
            price={29.99}
            image={require('../../assets/placeholder.png')}
            ecoScore={85}
          />
          <ProductCard 
            name="Bamboo Cutlery Set"
            price={15.99}
            image={require('../../assets/placeholder.png')}
            ecoScore={92}
          />
        </View>
      </View>
      
      <View style={styles.statsSection}>
        <ThemedText variant="heading" style={styles.sectionTitle}>Your Eco Stats</ThemedText>
        <View style={styles.statsCard}>
          <ThemedText variant="value" style={styles.statValue}>36kg</ThemedText>
          <ThemedText variant="label" style={styles.statLabel}>CO₂ Saved</ThemedText>
        </View>
        <View style={styles.statsCard}>
          <ThemedText variant="value" style={styles.statValue}>12</ThemedText>
          <ThemedText variant="label" style={styles.statLabel}>Eco Purchases</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#2a9d8f',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  featuredSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a9d8f',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
}); 