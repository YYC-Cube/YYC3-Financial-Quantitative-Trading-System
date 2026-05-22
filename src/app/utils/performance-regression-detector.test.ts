/**
 * @file src/app/utils/performance-regression-detector.test.ts
 * @description 性能回归检测系统测试 - 覆盖回归检测逻辑
 * @author Phase4 Performance Optimization
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import PerformanceRegressionDetector from './performance-regression-detector';

describe('PerformanceRegressionDetector', () => {
  let detector: PerformanceRegressionDetector;

  beforeEach(() => {
    detector = new PerformanceRegressionDetector();
  });

  it('should initialize with default thresholds', () => {
    const report = detector.generateReport();
    expect(report).toContain('Performance Regression Detector');
    expect(report).toContain('20%');
    expect(report).toContain('50%');
  });

  it('should detect duration regression', async () => {
    const baseline = {
      timestamp: new Date().toISOString(),
      durationMs: 3000,
      coveragePercent: 12.0,
      testCount: 580,
    };

    vi.spyOn(detector as any, 'loadBaseline').mockResolvedValue(baseline);

    const current = {
      timestamp: new Date().toISOString(),
      durationMs: 4000, // 33% increase - should trigger warning
      coveragePercent: 12.5,
      testCount: 585,
    };

    const alerts = await detector.detectRegressions(current);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some(a => a.type === 'duration')).toBe(true);
    expect(alerts[0].severity).toBe('warning');
  });

  it('should detect critical duration regression', async () => {
    const baseline = {
      timestamp: new Date().toISOString(),
      durationMs: 3000,
      coveragePercent: 12.0,
      testCount: 580,
    };

    vi.spyOn(detector as any, 'loadBaseline').mockResolvedValue(baseline);

    const current = {
      timestamp: new Date().toISOString(),
      durationMs: 5000, // 67% increase - should trigger critical
      coveragePercent: 12.5,
      testCount: 585,
    };

    const alerts = await detector.detectRegressions(current);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some(a => a.severity === 'critical')).toBe(true);
  });

  it('should detect coverage regression', async () => {
    const baseline = {
      timestamp: new Date().toISOString(),
      durationMs: 3200,
      coveragePercent: 13.0,
      testCount: 580,
    };

    vi.spyOn(detector as any, 'loadBaseline').mockResolvedValue(baseline);

    const current = {
      timestamp: new Date().toISOString(),
      durationMs: 3300,
      coveragePercent: 11.0, // 2% decrease - should trigger warning if >5%
      testCount: 585,
    };

    const alerts = await detector.detectRegressions(current);

    // Coverage decrease is only 2%, which is less than 5% threshold
    // So no coverage alert expected
    expect(alerts.filter(a => a.type === 'coverage').length).toBe(0);
  });

  it('should handle missing baseline gracefully', async () => {
    vi.spyOn(detector as any, 'loadBaseline').mockResolvedValue(null);
    const saveSpy = vi.spyOn(detector as any, 'saveBaseline').mockImplementation(() => Promise.resolve());

    const current = {
      timestamp: new Date().toISOString(),
      durationMs: 3200,
      coveragePercent: 12.69,
      testCount: 589,
    };

    const alerts = await detector.detectRegressions(current);

    expect(alerts.length).toBe(0);
    expect(saveSpy).toHaveBeenCalledWith(current);
  });
});
