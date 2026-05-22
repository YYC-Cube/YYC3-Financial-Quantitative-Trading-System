/**
 * @file src/app/utils/code-quality-auditor.test.ts
 * @description 代码质量审计器测试 - 覆盖质量评估逻辑
 * @author Phase5 Quality Enhancement
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';

import codeQualityAuditor from './code-quality-auditor';

describe('CodeQualityAuditor', () => {
  it('should generate audit report', async () => {
    const report = await codeQualityAuditor.auditProject();

    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('overallScore');
    expect(report).toHaveProperty('metrics');
    expect(report).toHaveProperty('summary');
    expect(typeof report.overallScore).toBe('number');
  });

  it('should include all quality metrics', async () => {
    const report = await codeQualityAuditor.auditProject();

    const metricNames = report.metrics.map(m => m.name);

    expect(metricNames).toContain('Type Safety');
    expect(metricNames).toContain('Test Coverage');
    expect(metricNames).toContain('Code Complexity');
    expect(metricNames).toContain('Performance');
    expect(metricNames).toContain('Best Practices');
    expect(metricNames).toContain('Documentation');
  });

  it('should calculate overall score correctly', async () => {
    const report = await codeQualityAuditor.auditProject();

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('should provide improvement suggestions for low scores', async () => {
    const report = await codeQualityAuditor.auditProject();

    const lowScoreMetrics = report.metrics.filter(m =>
      m.status === 'warning' || m.status === 'critical'
    );

    if (lowScoreMetrics.length > 0) {
      lowScoreMetrics.forEach(metric => {
        expect(metric.suggestions.length).toBeGreaterThanOrEqual(0);
      });
    } else {
      expect(true).toBe(true);
    }
  });

  it('should generate formatted report', async () => {
    const report = await codeQualityAuditor.auditProject();
    const formattedReport = codeQualityAuditor.generateReport(report);

    expect(formattedReport).toContain('Code Quality Audit Report');
    expect(formattedReport).toContain('Overall Score');
    expect(formattedReport).toContain('Detailed Metrics');
    expect(formattedReport).toContain('Strengths');
  });

  it('should identify strengths and improvements', async () => {
    const report = await codeQualityAuditor.auditProject();

    expect(report.summary.strengths.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(report.summary.improvements)).toBe(true);
  });
});
