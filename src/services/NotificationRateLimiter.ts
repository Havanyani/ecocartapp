import { AlertPriority } from './AlertPrioritization';
import { AlertData } from './PerformanceAlertService';

interface RateLimit {
  maxPerInterval: number;
  intervalMs: number;
  burstLimit: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class NotificationRateLimiter {
  private static rateLimits: Record<AlertPriority, RateLimit> = {
    [AlertPriority.CRITICAL]: {
      maxPerInterval: 10,
      intervalMs: 5 * 60 * 1000, // 5 minutes
      burstLimit: 3,
    },
    [AlertPriority.HIGH]: {
      maxPerInterval: 15,
      intervalMs: 15 * 60 * 1000, // 15 minutes
      burstLimit: 5,
    },
    [AlertPriority.MEDIUM]: {
      maxPerInterval: 20,
      intervalMs: 30 * 60 * 1000, // 30 minutes
      burstLimit: 8,
    },
    [AlertPriority.LOW]: {
      maxPerInterval: 30,
      intervalMs: 60 * 60 * 1000, // 1 hour
      burstLimit: 10,
    },
  };

  private static buckets: Record<string, TokenBucket> = {};

  static shouldAllowNotification(alert: AlertData): boolean {
    const bucketKey = this.getBucketKey(alert);
    const bucket = this.getOrCreateBucket(bucketKey, alert.priority);
    const rateLimit = this.rateLimits[alert.priority];

    this.refillBucket(bucket, rateLimit);

    if (bucket.tokens >= 1) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  private static getBucketKey(alert: AlertData): string {
    if (alert.groupId) {
      return `group_${alert.groupId}`;
    }
    return `type_${alert.type}_${alert.metric || 'general'}`;
  }

  private static getOrCreateBucket(key: string, priority: AlertPriority): TokenBucket {
    if (!this.buckets[key]) {
      this.buckets[key] = {
        tokens: this.rateLimits[priority].burstLimit,
        lastRefill: Date.now(),
      };
    }
    return this.buckets[key];
  }

  private static refillBucket(bucket: TokenBucket, rateLimit: RateLimit) {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / rateLimit.intervalMs) * rateLimit.maxPerInterval;

    bucket.tokens = Math.min(
      rateLimit.burstLimit,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;
  }

  static reset() {
    this.buckets = {};
  }

  static getQuotaRemaining(alert: AlertData): number {
    const bucketKey = this.getBucketKey(alert);
    const bucket = this.getOrCreateBucket(bucketKey, alert.priority);
    const rateLimit = this.rateLimits[alert.priority];

    this.refillBucket(bucket, rateLimit);
    return bucket.tokens;
  }
} 