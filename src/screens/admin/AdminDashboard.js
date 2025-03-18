import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard({ navigation }) {
  const modules = [
    {
      title: 'User Management',
      icon: '👥',
      route: 'UserManagement',
    },
    {
      title: 'Collection Analytics',
      icon: '📊',
      route: 'DetailedAnalytics',
    },
    {
      title: 'Route Management',
      icon: '🗺️',
      route: 'RouteManagement',
    },
    {
      title: 'Credit System',
      icon: '💰',
      route: 'CreditManagement',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.grid}>
        {modules.map((module, index) => (
          <TouchableOpacity
            key={index}
            style={styles.moduleCard}
            onPress={() => navigation.navigate(module.route)}
          >
            <Text style={styles.moduleIcon}>{module.icon}</Text>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  moduleCard: {
    width: '50%',
    padding: 8,
  },
  moduleIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 