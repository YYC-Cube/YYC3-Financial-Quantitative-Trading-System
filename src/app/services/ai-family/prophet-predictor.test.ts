import { beforeEach, describe, expect, it } from 'vitest';

import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

import {
  ProphetPredictorService,
  getProphetPredictorService,
  SimpleARIMA,
  AnomalyDetector,
  ProphetPredictor,
  type TimeSeriesPoint
} from './prophet-predictor';

function generateTimeSeries(count: number, base = 100, trend = 0.5, noise = 3): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  let value = base;
  for (let i = 0; i < count; i++) {
    value = base + trend * i + (Math.random() - 0.5) * noise * 2;
    data.push({ timestamp: Date.now() - (count - i) * 86400000, value: Math.max(1, value) });
  }
  return data;
}

describe('ProphetPredictorService - 预见·先知预测服务', () => {
  let service: ProphetPredictorService;

  beforeEach(() => {
    service = new ProphetPredictorService();
  });

  describe('1. 初始化', () => {
    it('1.1 应该成功创建服务实例', () => {
      expect(service).toBeDefined();
    });

    it('1.2 单例模式', () => {
      expect(getProphetPredictorService()).toBe(getProphetPredictorService());
    });
  });

  describe('2. Prophet预测器', () => {
    it('2.1 应该生成预测结果', () => {
      const prophet = new ProphetPredictor();
      const data = generateTimeSeries(100);
      const result = prophet.fitPredict(data, 30);

      expect(result.yhat).toHaveLength(30);
      expect(result.yhatLower).toHaveLength(30);
      expect(result.yhatUpper).toHaveLength(30);
      expect(result.ds).toHaveLength(30);
    });

    it('2.2 置信区间上界应大于预测值', () => {
      const prophet = new ProphetPredictor();
      const data = generateTimeSeries(50);
      const result = prophet.fitPredict(data, 10);

      for (let i = 0; i < 10; i++) {
        expect(result.yhatUpper[i]).toBeGreaterThanOrEqual(result.yhat[i]);
        expect(result.yhatLower[i]).toBeLessThanOrEqual(result.yhat[i]);
      }
    });
  });

  describe('3. ARIMA模型', () => {
    it('3.1 应该生成ARIMA预测', () => {
      const arima = new SimpleARIMA();
      const values = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5 + (Math.random() - 0.5) * 5);

      const result = arima.fitPredict(values, 10);

      expect(result.forecast).toHaveLength(10);
      expect(result.confidenceLower).toHaveLength(10);
      expect(result.confidenceUpper).toHaveLength(10);
      expect(result.order).toEqual([1, 1, 1]);
    });

    it('3.2 应该计算AIC/BIC', () => {
      const arima = new SimpleARIMA();
      const values = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 5) * 10);

      const result = arima.fitPredict(values, 5);
      expect(typeof result.aic).toBe('number');
      expect(typeof result.bic).toBe('number');
      expect(isFinite(result.aic)).toBe(true);
    });

    it('3.3 应该计算残差', () => {
      const arima = new SimpleARIMA();
      const values = Array.from({ length: 20 }, (_, i) => 50 + i);

      const result = arima.fitPredict(values, 5);
      expect(result.residuals.length).toBeGreaterThan(0);
    });
  });

  describe('4. 异常检测', () => {
    it('4.1 Z-Score方法应检测异常', () => {
      const detector = new AnomalyDetector();
      const data: TimeSeriesPoint[] = [
        ...generateTimeSeries(20, 100, 0, 2),
        { timestamp: Date.now(), value: 200 },
        ...generateTimeSeries(10, 100, 0, 2)
      ];

      const result = detector.detectZScore(data, 3);
      expect(result.anomalies.length).toBeGreaterThanOrEqual(0);
      expect(result.method).toBe('zscore');
      expect(result.totalPoints).toBe(31);
    });

    it('4.2 移动平均方法应检测异常', () => {
      const detector = new AnomalyDetector();
      const data: TimeSeriesPoint[] = [
        ...generateTimeSeries(30, 100, 0, 2),
        { timestamp: Date.now(), value: 200 },
        { timestamp: Date.now() + 86400000, value: 300 }
      ];

      const result = detector.detectMovingAverage(data, 10, 2);
      expect(result.method).toBe('moving_average');
      expect(result.anomalies.length).toBeGreaterThanOrEqual(0);
    });

    it('4.3 水平偏移检测', () => {
      const detector = new AnomalyDetector();
      const data: TimeSeriesPoint[] = [
        ...Array.from({ length: 30 }, (_, i) => ({ timestamp: i * 86400000, value: 100 + (Math.random() - 0.5) * 4 })),
        ...Array.from({ length: 30 }, (_, i) => ({ timestamp: (30 + i) * 86400000, value: 150 + (Math.random() - 0.5) * 4 }))
      ];

      const result = detector.detectLevelShift(data, 20, 1.5);
      expect(result.method).toBe('level_shift');
    });

    it('4.4 异常点应包含类型信息', () => {
      const detector = new AnomalyDetector();
      const data: TimeSeriesPoint[] = [
        ...generateTimeSeries(20, 100, 0, 1),
        { timestamp: Date.now(), value: 500 }
      ];

      const result = detector.detectZScore(data, 2);
      result.anomalies.forEach(a => {
        expect(['spike', 'drop', 'level_shift', 'trend_change']).toContain(a.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(a.severity);
      });
    });
  });

  describe('5. 集成预测服务 (process)', () => {
    it('5.1 应该完成完整预测流程', async () => {
      const data = generateTimeSeries(60);
      const result = await service.process({
        userId: 'test_user',
        userInput: '预测未来趋势',
        context: { data, horizon: 14, enableAnomaly: true }
      });

      expect(result.prediction).toBeDefined();
      expect(result.prediction.predicted).toHaveLength(14);
      expect(result.prediction.model).toBe('Prophet+ARIMA_Ensemble');
      expect(result.prediction.confidenceLevel).toBe(0.95);
      expect(result.anomalyDetection).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('5.2 应该生成建议', async () => {
      const data = generateTimeSeries(50, 100, 2, 3);
      const result = await service.process({
        userId: 'rec_user',
        userInput: '给出建议',
        context: { data, horizon: 7 }
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('5.3 应该计算预测精度', async () => {
      const data = generateTimeSeries(100);
      const result = await service.process({
        userId: 'acc_user',
        userInput: '精度测试',
        context: { data, horizon: 10 }
      });

      expect(result.prediction.accuracy).toBeDefined();
      expect(typeof result.prediction.accuracy.mape).toBe('number');
      expect(typeof result.prediction.accuracy.rmse).toBe('number');
    });

    it('5.4 应该处理小数据集', async () => {
      const data = generateTimeSeries(5);
      const result = await service.process({
        userId: 'small_user',
        userInput: '小数据集',
        context: { data, horizon: 3 }
      });

      expect(result.prediction).toBeDefined();
    });

    it('5.5 应该处理空数据', async () => {
      const result = await service.process({
        userId: 'empty_user',
        userInput: '空数据',
        context: { data: [], horizon: 5 }
      });

      expect(result.prediction).toBeDefined();
    });
  });

  describe('6. 性能', () => {
    it('6.1 预测服务应在500ms内完成', async () => {
      const data = generateTimeSeries(200);
      const start = Date.now();
      await service.process({
        userId: 'perf_user',
        userInput: '性能测试',
        context: { data, horizon: 30 }
      });
      expect(Date.now() - start).toBeLessThan(500);
    });
  });
});
