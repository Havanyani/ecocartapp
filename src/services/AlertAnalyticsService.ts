import { AlertPriority } from './AlertPrioritization';
import { AlertData, AlertType } from './PerformanceAlertService';

interface AlertAnalytics {
  totalAlerts: number;
  alertsByType: Record<AlertType, number>;
  alertsByPriority: Record<AlertPriority, number>;
  averageResponseTime: number;
  dismissalRate: number;
  groupEfficiency: number;
  mostFrequentMetric: string;
  trendingIssues: string[];
}

interface AlertTrend {
  metric: string;
  count: number;
  priority: AlertPriority;
  growth: number;
}

interface MetricAnalysis {
  mostFrequent: string;
}

export class AlertAnalyticsService {
  private static readonly TREND_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
  private static alertHistory: AlertData[] = [];
  private static dismissedAlerts = new Set<string>();
  private static responseTimeLog: Record<string, number> = {};

  static trackAlert(alert: AlertData) {
    this.alertHistory.push(alert);
    this.cleanupHistory();
  }

  static trackDismissal(alertId: string, responseTime: number) {
    this.dismissedAlerts.add(alertId);
    this.responseTimeLog[alertId] = responseTime;
  }

  static getAnalytics(): AlertAnalytics {
    const recentAlerts = this.getRecentAlerts();
    const metrics = this.calculateMetrics(recentAlerts);
    const trends = this.analyzeTrends(recentAlerts);

    return {
      totalAlerts: recentAlerts.length,
      alertsByType: this.countByType(recentAlerts),
      alertsByPriority: this.countByPriority(recentAlerts),
      averageResponseTime: this.calculateAverageResponseTime(),
      dismissalRate: this.calculateDismissalRate(recentAlerts),
      groupEfficiency: this.calculateGroupEfficiency(recentAlerts),
      mostFrequentMetric: metrics.mostFrequent,
      trendingIssues: trends.map(t => t.metric).slice(0, 5),
    };
  }

  private static getRecentAlerts(): AlertData[] {
    const cutoff = Date.now() - this.TREND_WINDOW;
    return this.alertHistory.filter(alert => alert.timestamp > cutoff);
  }

  private static countByType(alerts: AlertData[]): Record<AlertType, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<AlertType, number>);
  }

  private static countByPriority(alerts: AlertData[]): Record<AlertPriority, number> {
    return alerts.reduce((acc, alert) => {
      const key = alert.priority as keyof typeof acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {
      [AlertPriority.LOW]: 0,
      [AlertPriority.MEDIUM]: 0,
      [AlertPriority.HIGH]: 0,
      [AlertPriority.CRITICAL]: 0
    });
  }

  private static calculateAverageResponseTime(): number {
    const responseTimes = Object.values(this.responseTimeLog);
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private static calculateDismissalRate(alerts: AlertData[]): number {
    if (alerts.length === 0) return 0;
    const dismissedCount = alerts.filter(a => this.dismissedAlerts.has(a.id)).length;
    return dismissedCount / alerts.length;
  }

  private static calculateGroupEfficiency(alerts: AlertData[]): number {
    const groupedAlerts = alerts.filter(a => a.groupId);
    if (alerts.length === 0) return 1;
    return groupedAlerts.length / alerts.length;
  }

  private static analyzeTrends(alerts: AlertData[]): AlertTrend[] {
    const metricCounts = new Map<string, { recent: number; old: number; priority: AlertPriority }>();
    const midPoint = Date.now() - (this.TREND_WINDOW / 2);

    alerts.forEach(alert => {
      const key = `${alert.type}_${alert.metric}`;
      const entry = metricCounts.get(key) || { recent: 0, old: 0, priority: alert.priority };

      if (alert.timestamp > midPoint) {
        entry.recent++;
      } else {
        entry.old++;
      }

      metricCounts.set(key, entry);
    });

    return Array.from(metricCounts.entries())
      .map(([metric, { recent, old, priority }]) => ({
        metric,
        count: recent + old,
        priority,
        growth: old === 0 ? recent : (recent - old) / old,
      }))
      .sort((a, b) => b.growth - a.growth);
  }

  private static cleanupHistory() {
    const cutoff = Date.now() - this.TREND_WINDOW;
    this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > cutoff);

    // Cleanup dismissed alerts and response times
    for (const alertId of this.dismissedAlerts) {
      if (!this.alertHistory.some(a => a.id === alertId)) {
        this.dismissedAlerts.delete(alertId);
        delete this.responseTimeLog[alertId];
      }
    }
  }

  private static calculateMetrics(alerts: AlertData[]): MetricAnalysis {
    const metricCounts = alerts.reduce((acc, alert) => {
      if (alert.metric) {
        acc[alert.metric] = (acc[alert.metric] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.entries(metricCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return { mostFrequent };
  }
} 