import { AlertData, AlertType } from './PerformanceAlertService';

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

interface PriorityRule {
  condition: (alert: AlertData) => boolean;
  priority: AlertPriority;
}

export class AlertPrioritization {
  private static priorityRules: Record<AlertType, PriorityRule[]> = {
    performance: [
      {
        condition: (alert) => 
          alert.metric === 'Latency' && 
          alert.value! > (alert.threshold! * 3),
        priority: AlertPriority.CRITICAL,
      },
      {
        condition: (alert) => 
          alert.metric === 'Latency' && 
          alert.value! > (alert.threshold! * 2),
        priority: AlertPriority.HIGH,
      },
    ],
    error: [
      {
        condition: (alert) => 
          alert.metric === 'ErrorRate' && 
          alert.value! > 0.1,
        priority: AlertPriority.CRITICAL,
      },
    ],
    security: [
      {
        condition: () => true, // All security alerts are high priority
        priority: AlertPriority.HIGH,
      },
    ],
    critical: [
      {
        condition: () => true,
        priority: AlertPriority.CRITICAL,
      },
    ],
    warning: [
      {
        condition: () => true,
        priority: AlertPriority.MEDIUM,
      },
    ],
    info: [
      {
        condition: () => true,
        priority: AlertPriority.LOW,
      },
    ],
  };

  static calculatePriority(alert: AlertData): AlertPriority {
    const rules = this.priorityRules[alert.type] || [];
    const matchingRule = rules.find(rule => rule.condition(alert));
    return matchingRule?.priority || AlertPriority.LOW;
  }
} 