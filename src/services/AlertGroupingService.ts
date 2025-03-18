import { AlertPrioritization, AlertPriority } from './AlertPrioritization';
import { AlertData, AlertType } from './PerformanceAlertService';

interface GroupingStrategy {
  shouldGroup: (alert: AlertData, existingAlert: AlertData) => boolean;
  generateGroupId: (alert: AlertData) => string;
  getGroupTitle: (alerts: AlertData[]) => string;
}

export class AlertGroupingService {
  private static strategies: Record<AlertType, GroupingStrategy> = {
    performance: {
      shouldGroup: (alert, existingAlert) => 
        alert.metric === existingAlert.metric &&
        Math.abs(alert.timestamp - existingAlert.timestamp) < 30 * 60 * 1000, // 30 minutes
      generateGroupId: (alert) => `performance_${alert.metric}_${Math.floor(alert.timestamp / (30 * 60 * 1000))}`,
      getGroupTitle: (alerts) => `Performance Issues: ${alerts[0].metric}`,
    },
    error: {
      shouldGroup: (alert, existingAlert) =>
        alert.message === existingAlert.message &&
        Math.abs(alert.timestamp - existingAlert.timestamp) < 15 * 60 * 1000, // 15 minutes
      generateGroupId: (alert) => `error_${alert.message.slice(0, 20)}_${Math.floor(alert.timestamp / (15 * 60 * 1000))}`,
      getGroupTitle: (alerts) => `Multiple Errors (${alerts.length})`,
    },
    security: {
      shouldGroup: (alert, existingAlert) =>
        alert.metric === existingAlert.metric &&
        alert.value === existingAlert.value &&
        Math.abs(alert.timestamp - existingAlert.timestamp) < 5 * 60 * 1000, // 5 minutes
      generateGroupId: (alert) => `security_${alert.metric}_${alert.value}_${Math.floor(alert.timestamp / (5 * 60 * 1000))}`,
      getGroupTitle: (alerts) => `Security Alert: ${alerts[0].metric}`,
    },
    critical: {
      shouldGroup: () => false, // Don't group critical alerts
      generateGroupId: (alert) => `critical_${alert.id}`,
      getGroupTitle: (alerts) => alerts[0].title,
    },
    warning: {
      shouldGroup: (alert, existingAlert) => alert.message === existingAlert.message,
      generateGroupId: (alert) => `warning_${alert.message}`,
      getGroupTitle: (alerts) => `Warning: ${alerts.length} similar alerts`,
    },
    info: {
      shouldGroup: (alert, existingAlert) => alert.type === existingAlert.type,
      generateGroupId: (alert) => `info_${alert.type}`,
      getGroupTitle: (alerts) => `Info: ${alerts.length} notifications`,
    },
  };

  static processAlert(alert: AlertData, existingAlerts: AlertData[]): {
    groupId: string | null;
    shouldNotify: boolean;
  } {
    const strategy = this.strategies[alert.type];
    if (!strategy) return { groupId: null, shouldNotify: true };

    const priority = AlertPrioritization.calculatePriority(alert);
    const groupId = strategy.generateGroupId(alert);

    const existingGroupAlerts = existingAlerts.filter(
      existing => existing.groupId === groupId
    );

    if (existingGroupAlerts.length === 0) {
      return { groupId, shouldNotify: true };
    }

    const shouldNotify = this.shouldNotifyGroup(
      alert,
      existingGroupAlerts,
      priority
    );

    return { groupId, shouldNotify };
  }

  private static shouldNotifyGroup(
    newAlert: AlertData,
    groupAlerts: AlertData[],
    priority: AlertPriority
  ): boolean {
    const lastNotification = Math.max(...groupAlerts.map(a => a.timestamp));
    const timeSinceLastNotification = newAlert.timestamp - lastNotification;

    // Notification frequency based on priority
    const notificationThresholds = {
      [AlertPriority.CRITICAL]: 5 * 60 * 1000, // 5 minutes
      [AlertPriority.HIGH]: 15 * 60 * 1000, // 15 minutes
      [AlertPriority.MEDIUM]: 30 * 60 * 1000, // 30 minutes
      [AlertPriority.LOW]: 60 * 60 * 1000, // 1 hour
    };

    // Always notify for critical alerts if the value has worsened
    if (priority === AlertPriority.CRITICAL && 
        newAlert.value! > Math.max(...groupAlerts.map(a => a.value!))) {
      return true;
    }

    return timeSinceLastNotification > notificationThresholds[priority];
  }

  static summarizeGroup(alerts: AlertData[]): string {
    const strategy = this.strategies[alerts[0].type];
    if (!strategy) return alerts[0].title;

    return strategy.getGroupTitle(alerts);
  }
} 