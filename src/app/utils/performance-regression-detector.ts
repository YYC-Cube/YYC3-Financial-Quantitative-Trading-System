/**
 * @file src/app/utils/performance-regression-detector.ts
 * @description 性能回归检测系统 - 监控测试执行时间变化
 * @author Phase4 Performance Optimization
 * @version 1.0.0
 */

interface PerformanceBaseline {
  timestamp: string;
  durationMs: number;
  coveragePercent: number;
  testCount: number;
}

interface RegressionAlert {
  type: 'duration' | 'coverage' | 'test_count';
  current: number;
  baseline: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
}

class PerformanceRegressionDetector {
  private baselineFile = '.performance-baseline.json';
  private thresholds = {
    durationIncreasePercent: 20,      // 20% increase triggers warning
    durationCriticalPercent: 50,       // 50% increase is critical
    coverageDecreasePercent: 5,        // 5% decrease triggers warning
    testCountDecreasePercent: 10,      // 10% decrease triggers warning
  };

  async loadBaseline(): Promise<PerformanceBaseline | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem('performance-baseline');
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.error('Failed to load baseline:', error);
    }
    return null;
  }

  async saveBaseline(metrics: PerformanceBaseline): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('performance-baseline', JSON.stringify(metrics));
        console.log('✅ Baseline saved successfully');
      }
    } catch (error) {
      console.error('Failed to save baseline:', error);
    }
  }

  detectRegressions(current: PerformanceBaseline): RegressionAlert[] {
    const alerts: RegressionAlert[] = [];

    this.loadBaseline().then(baseline => {
      if (!baseline) {
        console.log('⚠️ No baseline found. Setting initial baseline...');
        this.saveBaseline(current);
        return alerts;
      }

      // Check duration regression
      const durationIncrease = ((current.durationMs - baseline.durationMs) / baseline.durationMs) * 100;
      if (durationIncrease > this.thresholds.durationCriticalPercent) {
        alerts.push({
          type: 'duration',
          current: current.durationMs,
          baseline: baseline.durationMs,
          threshold: this.thresholds.durationCriticalPercent,
          severity: 'critical',
          message: `🚨 CRITICAL: Test execution time increased by ${durationIncrease.toFixed(1)}% (${baseline.durationMs}ms → ${current.durationMs}ms)`
        });
      } else if (durationIncrease > this.thresholds.durationIncreasePercent) {
        alerts.push({
          type: 'duration',
          current: current.durationMs,
          baseline: baseline.durationMs,
          threshold: this.thresholds.durationIncreasePercent,
          severity: 'warning',
          message: `⚠️ WARNING: Test execution time increased by ${durationIncrease.toFixed(1)}% (${baseline.durationMs}ms → ${current.durationMs}ms)`
        });
      }

      // Check coverage regression
      const coverageDecrease = baseline.coveragePercent - current.coveragePercent;
      if (coverageDecrease > this.thresholds.coverageDecreasePercent) {
        alerts.push({
          type: 'coverage',
          current: current.coveragePercent,
          baseline: baseline.coveragePercent,
          threshold: this.thresholds.coverageDecreasePercent,
          severity: 'warning',
          message: `⚠️ WARNING: Coverage decreased by ${coverageDecrease.toFixed(2)}% (${baseline.coveragePercent}% → ${current.coveragePercent}%)`
        });
      }

      // Check test count regression
      const testCountDecrease = ((baseline.testCount - current.testCount) / baseline.testCount) * 100;
      if (testCountDecrease > this.thresholds.testCountDecreasePercent) {
        alerts.push({
          type: 'test_count',
          current: current.testCount,
          baseline: baseline.testCount,
          threshold: this.thresholds.testCountDecreasePercent,
          severity: 'warning',
          message: `⚠️ WARNING: Test count decreased by ${testCountDecrease.toFixed(1)}% (${baseline.testCount} → ${current.testCount})`
        });
      }

      if (alerts.length === 0) {
        console.log('✅ No performance regressions detected');
      } else {
        console.log('\n📊 Performance Regression Report:');
        console.log('═══════════════════════════════\n');
        alerts.forEach(alert => {
          console.log(alert.message);
        });

        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
          console.log(`\n🚨 ${criticalAlerts.length} CRITICAL regression(s) detected!`);
        }
      }

      // Auto-update baseline if no regressions
      if (alerts.length === 0 || alerts.every(a => a.severity === 'warning')) {
        this.saveBaseline(current);
      }
    });

    return alerts;
  }

  generateReport(): string {
    return `
╔════════════════════════════════════════════╗
║     Performance Regression Detector         ║
║     Version: 1.0.0                         ║
╠════════════════════════════════════════════╣
║ Thresholds:                                ║
║   • Duration Warning:  >${this.thresholds.durationIncreasePercent}% increase   ║
║   • Duration Critical: >${this.thresholds.durationCriticalPercent}% increase   ║
║   • Coverage Warning:  >${this.thresholds.coverageDecreasePercent}% decrease   ║
║   • Test Count Warning:>${this.thresholds.testCountDecreasePercent}% decrease  ║
╚════════════════════════════════════════════╝
    `;
  }
}

export default PerformanceRegressionDetector;
export type { PerformanceBaseline, RegressionAlert };
