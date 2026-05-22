/**
 * @file src/app/utils/web-vitals.test.ts
 * @description Unit tests for Web Vitals monitoring
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { clearVitals, getVitalsSummary, reportVital } from './web-vitals';

describe('Web Vitals Monitoring', () => {
  beforeEach(() => {
    (globalThis as any).__YYC3_DEV__ = true;
    clearVitals();
  });

  it('should report and store vital metrics', () => {
    const metric = {
      name: 'LCP',
      value: 2500,
      rating: 'good' as const,
      entries: [],
      id: 'test-1',
      navigationType: 'navigate',
    };

    reportVital(metric);
    const summary = getVitalsSummary();
    expect(summary.count).toBe(1);
    expect(summary.metrics['LCP'].value).toBe(2500);
    expect(summary.metrics['LCP'].rating).toBe('good');
  });

  it('should auto-rate LCP as good when value <= 2500ms', () => {
    reportVital({
      name: 'LCP',
      value: 2000,
      rating: 'needs-improvement' as any,
      entries: [],
      id: 'test-good',
      navigationType: 'navigate',
    });

    const summary = getVitalsSummary();
    expect(summary.metrics['LCP'].rating).toBe('good');
  });

  it('should generate summary statistics with multiple vitals', () => {
    reportVital({ name: 'LCP', value: 2000, rating: 'good' as any, entries: [], id: '1', navigationType: 'navigate' });
    reportVital({ name: 'FID', value: 50, rating: 'good' as any, entries: [], id: '2', navigationType: 'navigate' });
    reportVital({ name: 'CLS', value: 0.05, rating: 'good' as any, entries: [], id: '3', navigationType: 'navigate' });

    const summary = getVitalsSummary();
    expect(summary.count).toBe(3);
    expect(summary.averageRating).toBe('good');
  });

  it('should handle empty vitals state', () => {
    const summary = getVitalsSummary();
    expect(summary.count).toBe(0);
    expect(summary.averageRating).toBe('N/A');
  });
});
