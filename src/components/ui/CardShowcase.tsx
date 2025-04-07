/**
 * CardShowcase.tsx
 * 
 * A showcase component to demonstrate the Card component usage.
 */

import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';

export function CardShowcase() {
  const [pressCount, setPressCount] = React.useState(0);
  
  const handleCardPress = () => {
    setPressCount(prev => prev + 1);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Card Variants</Text>
      
      <Card
        title="Elevated Card"
        subtitle="This is the default card style with elevation"
        variant="elevated"
      >
        <Text>This card has a shadow that makes it appear elevated from the surface.</Text>
      </Card>
      
      <Card
        title="Outlined Card"
        subtitle="This card has a border instead of elevation"
        variant="outlined"
      >
        <Text>This card has a border and no elevation, making it appear flat.</Text>
      </Card>
      
      <Card
        title="Filled Card"
        subtitle="This card is filled with a solid background"
        variant="filled"
        backgroundColor="#E3F2FD"
      >
        <Text>This card has a custom background color and no elevation.</Text>
      </Card>
      
      <Text style={styles.sectionTitle}>Actionable Cards</Text>
      
      <Card
        title="Card with Action Button"
        subtitle="This card has an action button in the header"
        actionButton={
          <Button 
            label="Action" 
            onPress={() => alert('Action pressed!')} 
            size="small"
            variant="outline"
          />
        }
      >
        <Text>Cards can include action buttons in their header area.</Text>
      </Card>
      
      <Card
        title="Clickable Card"
        subtitle={`This entire card is clickable (Pressed ${pressCount} times)`}
        onPress={handleCardPress}
      >
        <Text>Click anywhere on this card to trigger an action.</Text>
        <Text style={styles.helperText}>The card will have hover effects on web.</Text>
      </Card>
      
      <Text style={styles.sectionTitle}>Content Layout</Text>
      
      <Card title="Card with Custom Content">
        <View style={styles.customContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="eco" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.contentText}>
            Cards can contain any type of content, including icons, images, lists, or other components.
          </Text>
        </View>
      </Card>
      
      <Card
        title="Full Width Card"
        fullWidth
      >
        <Text>This card extends to the full width of its container.</Text>
      </Card>
      
      <Card
        variant="outlined"
        padded={false}
      >
        <View style={styles.unpadded}>
          <Text style={styles.unpaddedTitle}>Unpadded Card</Text>
          <Text>This card has no padding, allowing content to extend to the edges.</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  customContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  contentText: {
    flex: 1,
  },
  unpadded: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  unpaddedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 