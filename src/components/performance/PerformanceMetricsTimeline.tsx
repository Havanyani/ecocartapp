import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  category: 'collection' | 'environmental' | 'financial';
  value?: {
    amount: number;
    unit: string;
  };
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface PerformanceMetricsTimelineProps {
  events: TimelineEvent[];
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsTimeline({
  events,
  title = 'Performance Timeline',
  subtitle,
}: PerformanceMetricsTimelineProps) {
  const getCategoryColor = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'in-progress': return '#ed6c02';
      case 'upcoming': return '#666';
      default: return '#666';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.timeline}>
        {sortedEvents.map((event, index) => (
          <View key={event.id} style={styles.eventContainer}>
            <View style={styles.timeColumn}>
              <ThemedText style={styles.dateText}>{formatDate(event.date)}</ThemedText>
              {index < events.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: getStatusColor(event.status) },
                  ]}
                />
              )}
            </View>

            <View style={styles.eventContent}>
              <View
                style={[
                  styles.eventIcon,
                  { backgroundColor: getCategoryColor(event.category) },
                ]}
              >
                <IconSymbol name={event.icon} size={20} color="#fff" />
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventHeader}>
                  <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                  {event.value && (
                    <ThemedText style={styles.eventValue}>
                      {event.value.amount.toLocaleString()} {event.value.unit}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={styles.eventDescription}>
                  {event.description}
                </ThemedText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(event.status) + '20' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(event.status) },
                    ]}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeline: {
    gap: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    alignItems: 'center',
    width: 100,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    marginLeft: 'auto',
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    flex: 1,
    gap: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventValue: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 