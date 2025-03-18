import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
  category: 'collection' | 'environmental' | 'financial';
  deadline: Date;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  milestones?: Array<{
    value: number;
    label: string;
    reached: boolean;
  }>;
}

interface PerformanceMetricsGoalsProps {
  goals: Goal[];
  title?: string;
  subtitle?: string;
  onGoalPress?: (id: string) => void;
}

export function PerformanceMetricsGoals({
  goals,
  title = 'Performance Goals',
  subtitle,
  onGoalPress,
}: PerformanceMetricsGoalsProps) {
  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'on-track': return '#00796b';
      case 'at-risk': return '#ed6c02';
      case 'behind': return '#d32f2f';
      default: return '#666';
    }
  };

  const formatProgress = (current: number, target: number) => {
    return `${Math.round((current / target) * 100)}%`;
  };

  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return a.deadline.getTime() - b.deadline.getTime();
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.goalsList}>
        {sortedGoals.map(goal => (
          <HapticTab
            key={goal.id}
            style={styles.goalCard}
            onPress={() => onGoalPress?.(goal.id)}
          >
            <View style={styles.goalHeader}>
              <View style={styles.goalInfo}>
                <IconSymbol
                  name={goal.icon as any}
                  size={24}
                  color={getCategoryColor(goal.category)}
                />
                <View style={styles.goalTitles}>
                  <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                  <ThemedText style={styles.goalDescription}>
                    {goal.description}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(goal.status) + '20' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: getStatusColor(goal.status) },
                  ]}
                >
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <ThemedText style={styles.progressText}>
                  {formatProgress(goal.current, goal.target)}
                </ThemedText>
                <ThemedText style={styles.progressValues}>
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                </ThemedText>
              </View>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(goal.current / goal.target) * 100}%`,
                      backgroundColor: getStatusColor(goal.status),
                    },
                  ]}
                />
              </View>
            </View>

            {goal.milestones && (
              <View style={styles.milestones}>
                {goal.milestones.map((milestone, index) => (
                  <View key={index} style={styles.milestone}>
                    <IconSymbol
                      name={milestone.reached ? 'check-circle' : 'circle-outline'}
                      size={16}
                      color={milestone.reached ? '#2e7d32' : '#666'}
                    />
                    <ThemedText
                      style={[
                        styles.milestoneText,
                        milestone.reached && styles.completedMilestone,
                      ]}
                    >
                      {milestone.label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.goalFooter}>
              <ThemedText style={styles.deadlineText}>
                Due by {formatDeadline(goal.deadline)}
              </ThemedText>
            </View>
          </HapticTab>
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
  goalsList: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  goalTitles: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  progressValues: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  milestones: {
    gap: 8,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneText: {
    fontSize: 14,
    color: '#666',
  },
  completedMilestone: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  goalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  deadlineText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
}); 