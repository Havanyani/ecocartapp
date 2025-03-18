import { SafeStorage } from '@/utils/storage';
import { Alert } from 'react-native';
import { performanceSettingsStore } from '@/stores/PerformanceSettingsStore';
import { MetricData } from '@/types/PerformanceMonitoring';
import { AlertGroupingService } from './AlertGroupingService';
import { AlertPrioritization } from './AlertPrioritization';

export type AlertType = 'performance' | 'error' | 'security' | 'critical' | 'warning' | 'info';

export interface AlertData {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  timestamp: number;
  groupId?: string;
  priority: AlertPriority;
}

interface AlertGroup {
  id: string;
  type: AlertType;
  alerts: AlertData[];
  count: number;
  lastUpdated: number;
}

export class PerformanceAlertService {
  private static listeners: Set<(alert: AlertData) => void> = new Set();
  private static activeAlerts: Map<string, AlertData> = new Map();
  private static alertGroups: Map<string, AlertGroup> = new Map();
  private static STORAGE_KEY = 'performance_alerts';

  static async initialize() {
    await this.loadPersistedAlerts();
    this.startCleanupInterval();
  }

  static addListener(listener: (alert: AlertData) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static async checkMetrics(metrics: MetricData) {
    if (!performanceSettingsStore.alertsEnabled) return;

    const { thresholds } = performanceSettingsStore;
    const checks = [
      this.checkLatency(metrics, thresholds),
      this.checkErrorRate(metrics, thresholds),
      this.checkCompression(metrics, thresholds),
      this.checkMemoryUsage(metrics),
      this.checkBatteryImpact(metrics),
      this.checkSecurityMetrics(metrics),
    ];

    await Promise.all(checks);
  }

  private static async checkLatency(metrics: MetricData, thresholds: any) {
    if (metrics.latency > thresholds.latency) {
      await this.createAlert({
        type: 'performance',
        title: 'High Latency Detected',
        message: 'Message latency is above the configured threshold.',
        metric: 'Latency',
        value: metrics.latency,
        threshold: thresholds.latency,
        priority: metrics.latency > thresholds.latency * 2 ? 2 : 1,
        groupId: 'latency',
      });
    }
  }

  // ... similar methods for other metric checks ...

  private static async createAlert(data: Omit<AlertData, 'id' | 'timestamp'>) {
    const alert: AlertData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...data,
    };

    if (data.groupId) {
      await this.addToGroup(alert);
    } else {
      await this.triggerAlert(alert);
    }
  }

  private static async addToGroup(alert: AlertData) {
    if (!alert.groupId) return;

    const { groupId, shouldNotify } = AlertGroupingService.processAlert(
      alert,
      Array.from(this.activeAlerts.values())
    );

    if (!groupId) {
      await this.triggerAlert(alert);
      return;
    }

    const group = this.alertGroups.get(alert.groupId) || {
      id: alert.groupId,
      type: alert.type,
      alerts: [],
      count: 0,
      lastUpdated: Date.now(),
    };

    group.alerts.push(alert);
    group.count++;
    group.lastUpdated = Date.now();

    this.alertGroups.set(alert.groupId, group);
    await this.persistAlerts();

    if (shouldNotify) {
      await this.triggerAlert({
        ...alert,
        title: AlertGroupingService.summarizeGroup(group.alerts),
        priority: AlertPrioritization.calculatePriority(alert),
      });
    }
  }

  private static async triggerAlert(alert: AlertData) {
    if (this.activeAlerts.has(alert.id)) return;

    this.activeAlerts.set(alert.id, alert);
    this.listeners.forEach(listener => listener(alert));
    await this.persistAlerts();
  }

  private static async persistAlerts() {
    try {
      const data = {
        alerts: Array.from(this.activeAlerts.values()),
        groups: Array.from(this.alertGroups.values()),
      };
      await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to persist alerts');
    }
  }

  private static async loadPersistedAlerts() {
    try {
      const data = await SafeStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        parsed.alerts.forEach((alert: AlertData) => {
          this.activeAlerts.set(alert.id, alert);
        });
        parsed.groups.forEach((group: AlertGroup) => {
          this.alertGroups.set(group.id, group);
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load persisted alerts');
    }
  }

  private static startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Clean up old alerts
      for (const [id, alert] of this.activeAlerts) {
        if (now - alert.timestamp > maxAge) {
          this.activeAlerts.delete(id);
        }
      }

      // Clean up old groups
      for (const [id, group] of this.alertGroups) {
        if (now - group.lastUpdated > maxAge) {
          this.alertGroups.delete(id);
        }
      }

      this.persistAlerts();
    }, 60 * 60 * 1000); // Run every hour
  }

  static async dismissAlert(alertId: string) {
    this.activeAlerts.delete(alertId);
    await this.persistAlerts();
  }

  static async dismissGroup(groupId: string) {
    this.alertGroups.delete(groupId);
    const alertsToRemove = Array.from(this.activeAlerts.values())
      .filter(alert => alert.groupId === groupId)
      .map(alert => alert.id);
    
    alertsToRemove.forEach(id => this.activeAlerts.delete(id));
    await this.persistAlerts();
  }
} 