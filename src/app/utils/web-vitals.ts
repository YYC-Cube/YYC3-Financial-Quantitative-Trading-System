/**
 * @file src/app/utils/web-vitals.ts
 * @description Web Vitals Monitoring - Core Web Vitals tracking for performance optimization
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType: string;
}

const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
} as const;

function getRating(name: keyof typeof thresholds, value: number): VitalMetric['rating'] {
  const threshold = thresholds[name];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

let vitalsData: VitalMetric[] = [];

export function reportVital(metric: VitalMetric): void {
  const rating = getRating(metric.name as keyof typeof thresholds, metric.value);
  vitalsData.push({ ...metric, rating });

  if (typeof window !== 'undefined' && (window as any).__YYC3_DEV__) {
    console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`);
  }
}

export function getVitals(): VitalMetric[] {
  return [...vitalsData];
}

export function getVitalsSummary(): {
  count: number;
  averageRating: string;
  metrics: Record<string, { value: number; rating: string }>;
} {
  if (vitalsData.length === 0) return { count: 0, averageRating: 'N/A', metrics: {} };

  const ratingScores = { good: 3, 'needs-improvement': 2, poor: 1 };
  const avgScore = vitalsData.reduce((sum, m) => sum + (ratingScores[m.rating] || 0), 0) / vitalsData.length;

  const metrics: Record<string, { value: number; rating: string }> = {};
  for (const vital of vitalsData) {
    metrics[vital.name] = { value: vital.value, rating: vital.rating };
  }

  return {
    count: vitalsData.length,
    averageRating: avgScore >= 2.5 ? 'good' : avgScore >= 1.8 ? 'needs-improvement' : 'poor',
    metrics,
  };
}

export function clearVitals(): void {
  vitalsData = [];
}
