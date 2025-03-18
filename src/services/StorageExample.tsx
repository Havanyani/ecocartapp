import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from './StorageService';

/**
 * Example component demonstrating the hybrid storage approach
 */
const StorageExample: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [recyclingEntries, setRecyclingEntries] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState('user-123'); // Simulate logged in user
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [theme, setTheme] = useState<{mode: string} | null>(null);

  // Initialize and load data
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setLoading(true);
        
        // Initialize SQLite DB
        await Storage.initSQLite();
        
        // Seed some example data if needed
        await seedExampleData();
        
        // Load materials (this will use cache if available)
        const materialsList = await Storage.getMaterials();
        setMaterials(materialsList);
        
        // Load user recycling entries
        const entries = await Storage.getRecyclingEntriesByUser(userId);
        setRecyclingEntries(entries);
        
        // Load user stats
        const stats = await Storage.getUserRecyclingStats(userId);
        setUserStats(stats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing storage:', error);
        setLoading(false);
      }
    };
    
    initializeStorage();
    
    // Example of storing preferences with MMKV
    Storage.setBoolean('app_notifications_enabled', true);
    Storage.setObject('app_theme', { mode: 'dark', accentColor: '#4CAF50' });
    
    // Cleanup function
    return () => {
      // Close DB when component unmounts
      Storage.close();
    };
  }, [userId]);
  
  // Load storage values when component mounts
  useEffect(() => {
    const loadStorageValues = async () => {
      try {
        const notifValue = await Storage.getBoolean('app_notifications_enabled');
        setNotificationsEnabled(!!notifValue);
        
        const themeValue = await Storage.getObject<{mode: string}>('app_theme');
        setTheme(themeValue);
      } catch (error) {
        console.error('Error loading storage values:', error);
      }
    };
    
    loadStorageValues();
  }, []);
  
  // Example function to seed some data for demonstration
  const seedExampleData = async () => {
    try {
      // Check if we already have materials
      const existingMaterials = await Storage.getAllMaterials();
      
      // Only seed if we don't have materials yet
      if (existingMaterials.length === 0) {
        const materialExamples = [
          { 
            id: 'plastic-pet', 
            name: 'PET Plastic', 
            category: 'Plastic',
            pointsPerKg: 10,
            description: 'Polyethylene terephthalate, used for water bottles',
            imageUrl: 'https://example.com/pet.jpg',
            recyclingTips: 'Rinse before recycling'
          },
          { 
            id: 'aluminum', 
            name: 'Aluminum', 
            category: 'Metal',
            pointsPerKg: 15,
            description: 'Used for cans and foil',
            imageUrl: 'https://example.com/aluminum.jpg',
            recyclingTips: 'Clean from food residue'
          },
          { 
            id: 'paper', 
            name: 'Paper', 
            category: 'Paper',
            pointsPerKg: 5,
            description: 'Newspapers, magazines, and cardboard',
            imageUrl: 'https://example.com/paper.jpg',
            recyclingTips: 'Keep dry and clean'
          }
        ];
        
        // Add materials
        for (const material of materialExamples) {
          await Storage.addMaterial(material);
        }
        
        // Add some recycling entries
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        await Storage.addRecyclingEntry({
          id: uuidv4(),
          materialId: 'plastic-pet',
          weight: 2.5,
          date: now.toISOString(),
          status: 'completed',
          userId,
          credits: 25,
          plasticSaved: 2.5,
          co2Reduced: 5.2,
          treesEquivalent: 0.3
        });
        
        await Storage.addRecyclingEntry({
          id: uuidv4(),
          materialId: 'aluminum',
          weight: 1.2,
          date: oneWeekAgo.toISOString(),
          status: 'completed',
          userId,
          credits: 18,
          plasticSaved: 0,
          co2Reduced: 12.8,
          treesEquivalent: 0.9
        });
        
        await Storage.addRecyclingEntry({
          id: uuidv4(),
          materialId: 'paper',
          weight: 3.8,
          date: twoWeeksAgo.toISOString(),
          status: 'completed',
          userId,
          credits: 19,
          plasticSaved: 0,
          co2Reduced: 3.5,
          treesEquivalent: 1.2
        });
        
        console.log('Example data seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };
  
  // Example function to add a new recycling entry
  const addNewRecyclingEntry = async () => {
    try {
      // Take the first material from the list as an example
      const material = materials[0];
      if (!material) return;
      
      const now = new Date();
      const entry = {
        id: uuidv4(),
        materialId: material.id,
        weight: Math.random() * 5 + 0.5, // Random weight between 0.5 and 5.5 kg
        date: now.toISOString(),
        status: 'completed',
        userId,
        credits: Math.floor(Math.random() * 30),
        plasticSaved: material.category === 'Plastic' ? Math.random() * 5 : 0,
        co2Reduced: Math.random() * 10,
        treesEquivalent: Math.random()
      };
      
      await Storage.addRecyclingEntry(entry);
      
      // Refresh the list
      const updatedEntries = await Storage.getRecyclingEntriesByUser(userId);
      setRecyclingEntries(updatedEntries);
      
      // Update stats
      const updatedStats = await Storage.getUserRecyclingStats(userId);
      setUserStats(updatedStats);
      
      console.log('New recycling entry added');
    } catch (error) {
      console.error('Error adding recycling entry:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Example</Text>
      
      {/* User Stats (From SQLite) */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>User Recycling Stats</Text>
        {userStats && (
          <>
            <Text>Total Weight: {userStats.totalWeight.toFixed(2)} kg</Text>
            <Text>Total Entries: {userStats.totalEntries}</Text>
            <Text>Total Credits: {userStats.totalCredits}</Text>
            <Text>CO2 Reduced: {userStats.co2Reduced.toFixed(2)} kg</Text>
            <Text>Trees Equivalent: {userStats.treesEquivalent.toFixed(2)}</Text>
          </>
        )}
      </View>
      
      {/* User Preferences (From MMKV) */}
      <View style={styles.prefsContainer}>
        <Text style={styles.sectionTitle}>User Preferences (MMKV)</Text>
        <Text>Notifications: {notificationsEnabled ? 'On' : 'Off'}</Text>
        {theme && (
          <Text>Theme: {theme.mode}</Text>
        )}
      </View>
      
      {/* Materials List (From SQLite with MMKV caching) */}
      <Text style={styles.sectionTitle}>Materials ({materials.length})</Text>
      <FlatList
        data={materials}
        keyExtractor={(item: any) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.materialsList}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.materialCard}>
            <Text style={styles.materialName}>{item.name}</Text>
            <Text style={styles.materialCategory}>{item.category}</Text>
            <Text>{item.points_per_kg} pts/kg</Text>
          </View>
        )}
      />
      
      {/* Recycling Entries (From SQLite) */}
      <Text style={styles.sectionTitle}>Recent Recycling ({recyclingEntries.length})</Text>
      <FlatList
        data={recyclingEntries}
        keyExtractor={(item: any) => item.id}
        style={styles.entriesList}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.entryItem}>
            <Text style={styles.entryMaterial}>{item.material_name || item.material_id}</Text>
            <Text>{new Date(item.date).toLocaleDateString()}</Text>
            <Text>{item.weight.toFixed(1)} kg</Text>
            <Text>{item.credits} pts</Text>
          </View>
        )}
      />
      
      {/* Add New Entry Button */}
      <TouchableOpacity style={styles.button} onPress={addNewRecyclingEntry}>
        <Text style={styles.buttonText}>Add Random Recycling</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#388e3c',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  prefsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  materialsList: {
    flexGrow: 0,
    height: 100,
    marginBottom: 8,
  },
  materialCard: {
    backgroundColor: 'white',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    width: 120,
    elevation: 2,
  },
  materialName: {
    fontWeight: 'bold',
  },
  materialCategory: {
    color: '#666',
    marginBottom: 4,
  },
  entriesList: {
    flex: 1,
    marginBottom: 16,
  },
  entryItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  entryMaterial: {
    fontWeight: 'bold',
    flex: 1,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StorageExample; 