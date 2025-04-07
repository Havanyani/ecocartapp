/**
 * CollectionTimeline.tsx
 * 
 * Component for displaying collection history with timestamps and events.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionItem } from '@/types/collections';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CollectionTimelineProps {
  collection: CollectionItem;
}

interface TimelineEvent {
  id: string;
  type: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  timestamp: string;
  description: string;
  icon: string;
}

export function CollectionTimeline({ collection }: CollectionTimelineProps) {
  const { theme } = useTheme();

  const getTimelineEvents = (collection: CollectionItem): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add scheduled event
    events.push({
      id: 'scheduled',
      type: 'scheduled',
      timestamp: collection.scheduledDate,
      description: 'Collection scheduled',
      icon: 'calendar-clock',
    });

    // Add in-progress event if applicable
    if (collection.status === 'in_progress' || collection.status === 'completed') {
      events.push({
        id: 'in_progress',
        type: 'in_progress',
        timestamp: collection.updatedAt,
        description: 'Collection in progress',
        icon: 'truck-fast',
      });
    }

    // Add completed event if applicable
    if (collection.status === 'completed') {
      events.push({
        id: 'completed',
        type: 'completed',
        timestamp: collection.updatedAt,
        description: 'Collection completed',
        icon: 'check-circle',
      });
    }

    // Add cancelled event if applicable
    if (collection.status === 'cancelled') {
      events.push({
        id: 'cancelled',
        type: 'cancelled',
        timestamp: collection.updatedAt,
        description: 'Collection cancelled',
        icon: 'close-circle',
      });
    }

    return events;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'scheduled':
        return theme.colors.info;
      case 'in_progress':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return timestamp;
    }
  };

  const timelineEvents = getTimelineEvents(collection);

  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.title}>Collection Timeline</Text>
      
      {timelineEvents.map((event, index) => (
        <View key={event.id} style={styles.eventContainer}>
          <View style={styles.timelineLine}>
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: getEventColor(timelineEvents[index - 1].type),
                  },
                ]}
              />
            )}
            <View
              style={[
                styles.dot,
                { backgroundColor: getEventColor(event.type) },
              ]}
            />
            {index < timelineEvents.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: getEventColor(event.type),
                  },
                ]}
              />
            )}
          </View>
          
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <IconSymbol
                name={event.icon}
                size={20}
                color={getEventColor(event.type)}
              />
              <Text
                style={[
                  styles.eventType,
                  { color: getEventColor(event.type) },
                ]}
              >
                {event.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.eventDescription}>
              {event.description}
            </Text>
            
            <Text style={styles.eventTimestamp}>
              {formatTimestamp(event.timestamp)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventTimestamp: {
    fontSize: 12,
    color: '#999',
  },
}); 