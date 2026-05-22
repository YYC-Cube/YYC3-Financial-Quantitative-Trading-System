import { beforeEach, describe, expect, it } from 'vitest';

import {
  YuShuAnalysisEngine,
  getYuShuAnalysisEngine,
  AnalysisType,
  type ChartDataPoint,
  type ChartDataset
} from './yu-shu-analysis';
import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

function generateTestData(count: number, baseValue = 100, volatility = 5): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let value = baseValue;
  for (let i = 0; i < count; i++) {
    value += (Math.random() - 0.48) * volatility;
    data.push({
      timestamp: Date.now() - (count - i) * 86400000,
      value: Math.max(1, value),
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  return data;
}

describe('YuShuAnalysisEngine - 语枢·万物数据分析引擎', () => {
  let engine: YuShuAnalysisEngine;

  beforeEach(() => {
    engine = new YuShuAnalysisEngine();
  });

  describe('1. 初始化', () => {
    it('1.1 应该成功创建引擎实例', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(YuShuAnalysisEngine);
    });

    it('1.2 单例模式应该返回相同实例', () => {
      const a = getYuShuAnalysisEngine();
      const b = getYuShuAnalysisEngine();
      expect(a).toBe(b);
    });
  });

  describe('2. 图表数据解析', () => {
    it('2.1 应该解析标准格式数据', () => {
      const raw = [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
        { timestamp: 3000, value: 30 }
      ];
      const result = engine.parseChartData(raw);

      expect(result.totalPoints).toBe(3);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data[0].value).toBe(10);
    });

    it('2.2 应该处理空数据', () => {
      const result = engine.parseChartData([]);
      expect(result.totalPoints).toBe(0);
      expect(result.datasets).toHaveLength(0);
    });

    it('2.3 应该按时间排序', () => {
      const raw = [
        { timestamp: 3000, value: 30 },
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 }
      ];
      const result = engine.parseChartData(raw);
      expect(result.datasets[0].data[0].value).toBe(10);
      expect(result.datasets[0].data[2].value).toBe(30);
    });

    it('2.4 应该检测日级别粒度', () => {
      const raw = generateTestData(10);
      const result = engine.parseChartData(raw);
      expect(result.granularity).toBeDefined();
    });
  });

  describe('3. 统计指标计算', () => {
    it('3.1 应该正确计算均值', () => {
      const data: ChartDataPoint[] = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 20 },
        { timestamp: 3, value: 30 }
      ];
      const stats = engine.calculateStatisticalIndicators(data);
      expect(stats.mean).toBeCloseTo(20, 1);
    });

    it('3.2 应该正确计算中位数', () => {
      const data: ChartDataPoint[] = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 20 },
        { timestamp: 3, value: 30 }
      ];
      const stats = engine.calculateStatisticalIndicators(data);
      expect(stats.median).toBeCloseTo(20, 1);
    });

    it('3.3 应该正确计算标准差', () => {
      const data: ChartDataPoint[] = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 10 },
        { timestamp: 3, value: 10 }
      ];
      const stats = engine.calculateStatisticalIndicators(data);
      expect(stats.standardDeviation).toBeCloseTo(0, 1);
    });

    it('3.4 应该处理空数据', () => {
      const stats = engine.calculateStatisticalIndicators([]);
      expect(stats.sampleSize).toBe(0);
      expect(stats.mean).toBe(0);
    });

    it('3.5 应该计算百分位数', () => {
      const data = generateTestData(100);
      const stats = engine.calculateStatisticalIndicators(data);
      expect(stats.percentile25).toBeLessThanOrEqual(stats.percentile50);
      expect(stats.percentile50).toBeLessThanOrEqual(stats.percentile75);
      expect(stats.percentile75).toBeLessThanOrEqual(stats.percentile90);
    });

    it('3.6 应该计算变异系数', () => {
      const data = generateTestData(50, 100, 10);
      const stats = engine.calculateStatisticalIndicators(data);
      expect(stats.coefficientOfVariation).toBeGreaterThan(0);
    });
  });

  describe('4. 金融指标计算', () => {
    it('4.1 应该计算累计收益率', () => {
      const data: ChartDataPoint[] = [
        { timestamp: 1, value: 100 },
        { timestamp: 2, value: 110 }
      ];
      const fin = engine.calculateFinancialIndicators(data);
      expect(fin.cumulativeReturn).toBeCloseTo(0.1, 2);
    });

    it('4.2 应该计算夏普比率', () => {
      const data = generateTestData(100, 100, 5);
      const fin = engine.calculateFinancialIndicators(data);
      expect(typeof fin.sharpeRatio).toBe('number');
      expect(isFinite(fin.sharpeRatio)).toBe(true);
    });

    it('4.3 应该计算最大回撤', () => {
      const data: ChartDataPoint[] = [
        { timestamp: 1, value: 100 },
        { timestamp: 2, value: 120 },
        { timestamp: 3, value: 90 },
        { timestamp: 4, value: 110 }
      ];
      const fin = engine.calculateFinancialIndicators(data);
      expect(fin.maxDrawdown).toBeGreaterThan(0);
    });

    it('4.4 应该计算VaR', () => {
      const data = generateTestData(100, 100, 5);
      const fin = engine.calculateFinancialIndicators(data);
      expect(typeof fin.valueAtRisk95).toBe('number');
    });

    it('4.5 应该处理不足数据', () => {
      const data: ChartDataPoint[] = [{ timestamp: 1, value: 100 }];
      const fin = engine.calculateFinancialIndicators(data);
      expect(fin.cumulativeReturn).toBe(0);
    });
  });

  describe('5. 趋势分析', () => {
    it('5.1 应该识别上升趋势', () => {
      const data: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: i,
        value: 100 + i * 2
      }));
      const trend = engine.analyzeTrend(data);
      expect(trend.direction).toBe('upward');
      expect(trend.slope).toBeGreaterThan(0);
    });

    it('5.2 应该识别下降趋势', () => {
      const data: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: i,
        value: 200 - i * 3
      }));
      const trend = engine.analyzeTrend(data);
      expect(trend.direction).toBe('downward');
      expect(trend.slope).toBeLessThan(0);
    });

    it('5.3 应该计算移动平均线', () => {
      const data = generateTestData(60);
      const trend = engine.analyzeTrend(data);
      expect(trend.movingAverages.sma5.length).toBe(60);
      expect(trend.movingAverages.ema12.length).toBe(60);
    });

    it('5.4 应该计算MACD', () => {
      const data = generateTestData(50);
      const trend = engine.analyzeTrend(data);
      expect(trend.macd.macdLine.length).toBe(50);
      expect(trend.macd.signalLine.length).toBe(50);
      expect(trend.macd.histogram.length).toBe(50);
    });

    it('5.5 应该识别支撑位和阻力位', () => {
      const data = generateTestData(50);
      const trend = engine.analyzeTrend(data);
      expect(trend.supportLevel).toBeLessThanOrEqual(trend.resistanceLevel);
    });
  });

  describe('6. 相关性分析', () => {
    it('6.1 应该计算两组数据的相关系数', () => {
      const datasets: ChartDataset[] = [
        { id: 'a', name: 'A', type: 'line', data: Array.from({ length: 20 }, (_, i) => ({ timestamp: i, value: i * 10 })) },
        { id: 'b', name: 'B', type: 'line', data: Array.from({ length: 20 }, (_, i) => ({ timestamp: i, value: i * 10 + 5 })) }
      ];
      const corr = engine.analyzeCorrelation(datasets);
      expect(corr.pairs).toHaveLength(1);
      expect(corr.pairs[0].correlation).toBeGreaterThan(0.9);
    });

    it('6.2 应该处理不足数据集', () => {
      const corr = engine.analyzeCorrelation([]);
      expect(corr.pairs).toHaveLength(0);
    });
  });

  describe('7. 风险评估', () => {
    it('7.1 应该评估综合风险', () => {
      const data = generateTestData(50, 100, 10);
      const risk = engine.assessRisk(data);
      expect(['low', 'medium', 'high', 'extreme']).toContain(risk.overallRisk);
      expect(risk.riskScore).toBeGreaterThanOrEqual(0);
      expect(risk.riskScore).toBeLessThanOrEqual(1);
    });

    it('7.2 应该生成风险建议', () => {
      const data = generateTestData(50, 100, 15);
      const risk = engine.assessRisk(data);
      expect(risk.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('8. 报告生成', () => {
    it('8.1 应该生成完整分析报告', async () => {
      const data = generateTestData(50);
      const request: FamilyOrchestrationRequest = {
        userId: 'report_user',
        userInput: '生成分析报告',
        context: {
          data,
          analysisTypes: [AnalysisType.COMPREHENSIVE],
          includeReport: true
        }
      };

      const result = await engine.process(request);

      expect(result.report).toBeDefined();
      expect(result.report?.sections.length).toBeGreaterThan(0);
      expect(result.report?.executiveSummary).toBeDefined();
      expect(result.report?.keyFindings.length).toBeGreaterThan(0);
      expect(result.report?.id).toMatch(/^rpt_/);
    });

    it('8.2 报告应包含金融指标章节', async () => {
      const data = generateTestData(30);
      const request: FamilyOrchestrationRequest = {
        userId: 'fin_report_user',
        userInput: '金融分析',
        context: {
          data,
          analysisTypes: [AnalysisType.FINANCIAL],
          includeReport: true
        }
      };

      const result = await engine.process(request);
      const finSection = result.report?.sections.find(s => s.title.includes('金融'));
      expect(finSection).toBeDefined();
      expect(finSection?.priority).toBe('critical');
    });

    it('8.3 应该处理process请求', async () => {
      const data = generateTestData(20);
      const result = await engine.process({
        userId: 'test_user',
        userInput: '分析',
        context: { data, analysisTypes: [AnalysisType.STATISTICAL] }
      });

      expect(result.results.statistical).toBeDefined();
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('9. 性能', () => {
    it('9.1 大数据量分析应在200ms内完成', async () => {
      const data = generateTestData(1000);
      const start = Date.now();
      engine.calculateStatisticalIndicators(data);
      engine.calculateFinancialIndicators(data);
      engine.analyzeTrend(data);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });
});
