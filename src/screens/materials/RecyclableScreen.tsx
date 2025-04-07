import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCard } from '../../components/materials/MaterialCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useMaterials } from '../../hooks/useMaterials';
import { useScreenCache } from '../../hooks/useScreenCache';
import { Material } from '../../types/materials';

function RecyclableScreen() {
  const { theme } = useTheme();
  const { materials, isLoading, error, fetchMaterials, filterMaterials } = useMaterials();
  const { set, get } = useScreenCache();

  const recyclableMaterials = filterMaterials('recyclable');

  const renderItem = ({ item }: { item: Material }) => (
    <MaterialCard
      material={item}
      onPress={() => {
        // TODO: Navigate to material details
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={recyclableMaterials}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={fetchMaterials}
        onEndReached={() => {
          // TODO: Implement pagination
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
});

export default RecyclableScreen; 