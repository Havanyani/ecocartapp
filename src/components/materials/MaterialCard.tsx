import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { Material } from '../../types/materials';

interface MaterialCardProps {
  material: Material;
  onPress: () => void;
}

export function MaterialCard({ material, onPress }: MaterialCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {material.name}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {material.description}
      </Text>
      <Text style={[styles.category, { color: theme.colors.primary }]}>
        {material.category}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
