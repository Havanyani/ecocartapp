import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getColor, getSpacing, useTheme } from '../../theme';

/**
 * Example component that demonstrates how to use the unified theme system
 */
const ThemeExample: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Get theme values using helper functions
  const primaryColor = getColor(theme, 'primary');
  const spacing = getSpacing(theme, 'md');

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md
      }
    ]}>
      <Text style={[
        styles.title,
        { color: theme.colors.text }
      ]}>
        Theme Example
      </Text>
      
      <Text style={[
        styles.subtitle,
        { color: theme.colors.textSecondary }
      ]}>
        Current theme: {theme.dark ? 'Dark' : 'Light'}
      </Text>
      
      <View style={styles.colorPalette}>
        {Object.entries(theme.colors).map(([name, value]) => (
          <View key={name} style={styles.colorItem}>
            <View 
              style={[
                styles.colorSwatch, 
                { backgroundColor: value }
              ]} 
            />
            <Text style={[
              styles.colorName,
              { color: theme.colors.text }
            ]}>
              {name}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: theme.colors.primary,
            marginTop: theme.spacing.lg
          }
        ]}
        onPress={toggleTheme}
      >
        <Text style={styles.buttonText}>
          Toggle Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '30%',
    marginBottom: 12,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  colorName: {
    fontSize: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ThemeExample; 