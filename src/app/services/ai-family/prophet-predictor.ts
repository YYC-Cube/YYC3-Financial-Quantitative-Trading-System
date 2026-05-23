import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface ForecastResult {
  predicted: TimeSeriesPoint[];
  confidenceUpper: TimeSeriesPoint[];
  confidenceLower: TimeSeriesPoint[];
  confidenceLevel: number;
  model: string;
  accuracy: ForecastAccuracy;
  metadata: {
    trainingPoints: number;
    forecastHorizon: number;
    processingTimeMs: number;
  };
}

export interface ForecastAccuracy {
  mape: number;
  mae: number;
  rmse: number;
  mase: number;
  r2: number;
}

export interface AnomalyDetectionResult {
  anomalies: AnomalyPoint[];
  threshold: number;
  method: string;
  totalPoints: number;
  anomalyRate: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnomalyPoint {
  index: number;
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;
  score: number;
  type: 'spike' | 'drop' | 'level_shift' | 'trend_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
  period: number;
  method: 'additive' | 'multiplicative';
}

export interface ProphetForecast {
  ds: number[];
  yhat: number[];
  yhatLower: number[];
  yhatUpper: number[];
  trend: number[];
  weekly: number[];
  yearly: number[];
}

export interface ARIMAResult {
  forecast: number[];
  confidenceLower: number[];
  confidenceUpper: number[];
  order: [number, number, number];
  aic: number;
  bic: number;
  residuals: number[];
}

export class ProphetPredictor {
  private yearlyPeriod = 365.25;
  private weeklyPeriod = 7;

  fitPredict(data: TimeSeriesPoint[], horizon: number): ProphetForecast {
    const values = data.map(d => d.value);
    const n = values.length;

    const trend = this.fitLinearTrend(values);
    const detrended = values.map((v, i) => v - trend[i]);

    const weekly = this.extractWeeklySeasonality(detrended, n);
    const yearly = this.extractYearlySeasonality(detrended, n);

    const combined = values.map((v, i) => trend[i] + weekly[i % 7] + yearly[i % 365]);

    const residuals = values.map((v, i) => v - combined[i]);
    const residualStd = this.std(residuals);

    const futureTrend = this.extrapolateTrend(trend, horizon);
    const ds = Array.from({ length: horizon }, (_, i) => {
      const lastTs = data.length > 0 ? data[data.length - 1].timestamp : Date.now();
      return lastTs + (i + 1) * 86400000;
    });

    const yhat: number[] = [];
    const yhatLower: number[] = [];
    const yhatUpper: number[] = [];

    for (let i = 0; i < horizon; i++) {
      const predicted = futureTrend[i] + weekly[(n + i) % 7] + yearly[(n + i) % 365];
      const uncertainty = residualStd * Math.sqrt(1 + i * 0.1);
      yhat.push(predicted);
      yhatLower.push(predicted - 1.96 * uncertainty);
      yhatUpper.push(predicted + 1.96 * uncertainty);
    }

    return {
      ds,
      yhat,
      yhatLower,
      yhatUpper,
      trend: futureTrend,
      weekly: Array.from({ length: horizon }, (_, i) => weekly[(n + i) % 7]),
      yearly: Array.from({ length: horizon }, (_, i) => yearly[(n + i) % 365])
    };
  }

  private fitLinearTrend(values: number[]): number[] {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (values[i] - yMean);
      den += (i - xMean) * (i - xMean);
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;
    return values.map((_, i) => slope * i + intercept);
  }

  private extractWeeklySeasonality(detrended: number[], n: number): number[] {
    const weekly = new Array(7).fill(0);
    const counts = new Array(7).fill(0);
    for (let i = 0; i < n; i++) {
      weekly[i % 7] += detrended[i];
      counts[i % 7]++;
    }
    return weekly.map((v, i) => counts[i] > 0 ? v / counts[i] : 0);
  }

  private extractYearlySeasonality(detrended: number[], n: number): number[] {
    const yearly = new Array(365).fill(0);
    const counts = new Array(365).fill(0);
    for (let i = 0; i < n; i++) {
      yearly[i % 365] += detrended[i];
      counts[i % 365]++;
    }
    return yearly.map((v, i) => counts[i] > 0 ? v / counts[i] : 0);
  }

  private extrapolateTrend(trend: number[], horizon: number): number[] {
    const n = trend.length;
    if (n < 2) return new Array(horizon).fill(trend[0] || 0);
    const slope = (trend[n - 1] - trend[Math.max(0, n - 10)]) / Math.min(10, n - 1);
    const last = trend[n - 1];
    return Array.from({ length: horizon }, (_, i) => last + slope * (i + 1));
  }

  private std(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length);
  }
}

export class SimpleARIMA {
  fitPredict(values: number[], horizon: number, order: [number, number, number] = [1, 1, 1]): ARIMAResult {
    const [p, d] = order;
    let diff = [...values];
    for (let i = 0; i < d; i++) {
      diff = diff.slice(1).map((v, idx) => v - diff[idx]);
    }

    const arCoeffs = this.fitAR(diff, p);
    const residuals = this.computeResiduals(diff, arCoeffs);

    const forecast: number[] = [];
    const lastValues = diff.slice(-p);

    for (let h = 0; h < horizon; h++) {
      let pred = 0;
      for (let j = 0; j < Math.min(p, lastValues.length); j++) {
        pred += arCoeffs[j] * lastValues[lastValues.length - 1 - j];
      }
      forecast.push(pred);
      lastValues.push(pred);
    }

    let result = [...values];
    for (let i = 0; i < d; i++) {
      result = result.slice(1).map((v, idx) => v + result[idx]);
    }

    const lastOriginal = values[values.length - 1];
    const cumulativeForecast: number[] = [];
    let cumSum = lastOriginal;
    for (const f of forecast) {
      cumSum += f;
      cumulativeForecast.push(cumSum);
    }

    const residualStd = this.std(residuals);
    const confidenceLower = cumulativeForecast.map((v, i) => v - 1.96 * residualStd * Math.sqrt(i + 1));
    const confidenceUpper = cumulativeForecast.map((v, i) => v + 1.96 * residualStd * Math.sqrt(i + 1));

    const _n = values.length;
    const _ssTot = values.reduce((acc, v) => acc + (v - values.reduce((a, b) => a + b, 0) / _n) ** 2, 0);
    const ssRes = residuals.reduce((acc, v) => acc + v * v, 0);

    return {
      forecast: cumulativeForecast,
      confidenceLower,
      confidenceUpper,
      order,
      aic: _n * Math.log(ssRes / _n) + 2 * (p + 1),
      bic: _n * Math.log(ssRes / _n) + (p + 1) * Math.log(_n),
      residuals
    };
  }

  private fitAR(data: number[], p: number): number[] {
    if (data.length <= p || p === 0) return [0];
    const y = data.slice(p);
    const coeffs: number[] = [];

    for (let j = 0; j < p; j++) {
      let num = 0, den = 0;
      for (let i = 0; i < y.length; i++) {
        num += y[i] * data[p + i - 1 - j];
        den += data[p + i - 1 - j] ** 2;
      }
      coeffs.push(den !== 0 ? num / den : 0);
    }

    return coeffs;
  }

  private computeResiduals(data: number[], arCoeffs: number[]): number[] {
    const p = arCoeffs.length;
    const residuals: number[] = [];
    for (let i = p; i < data.length; i++) {
      let predicted = 0;
      for (let j = 0; j < p; j++) {
        predicted += arCoeffs[j] * data[i - 1 - j];
      }
      residuals.push(data[i] - predicted);
    }
    return residuals;
  }

  private std(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length);
  }
}

export class AnomalyDetector {
  detectZScore(data: TimeSeriesPoint[], threshold: number = 3): AnomalyDetectionResult {
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length);

    const anomalies: AnomalyPoint[] = [];
    for (let i = 0; i < values.length; i++) {
      const score = std !== 0 ? Math.abs(values[i] - mean) / std : 0;
      if (score > threshold) {
        anomalies.push({
          index: i,
          timestamp: data[i].timestamp,
          value: values[i],
          expectedValue: mean,
          deviation: values[i] - mean,
          score,
          type: values[i] > mean ? 'spike' : 'drop',
          severity: score > threshold * 2 ? 'critical' : score > threshold * 1.5 ? 'high' : 'medium'
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'zscore',
      totalPoints: values.length,
      anomalyRate: anomalies.length / values.length,
      severity: this.aggregateSeverity(anomalies)
    };
  }

  detectMovingAverage(data: TimeSeriesPoint[], windowSize: number = 20, threshold: number = 2.5): AnomalyDetectionResult {
    const values = data.map(d => d.value);
    const anomalies: AnomalyPoint[] = [];

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const ma = window.reduce((a, b) => a + b, 0) / windowSize;
      const residuals = window.map(v => v - ma);
      const std = Math.sqrt(residuals.reduce((acc, v) => acc + v * v, 0) / windowSize);

      const deviation = values[i] - ma;
      const score = std !== 0 ? Math.abs(deviation) / std : 0;

      if (score > threshold) {
        anomalies.push({
          index: i,
          timestamp: data[i].timestamp,
          value: values[i],
          expectedValue: ma,
          deviation,
          score,
          type: this.classifyAnomaly(values, i, windowSize),
          severity: score > threshold * 2 ? 'critical' : score > threshold * 1.5 ? 'high' : 'medium'
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'moving_average',
      totalPoints: values.length,
      anomalyRate: anomalies.length / values.length,
      severity: this.aggregateSeverity(anomalies)
    };
  }

  detectLevelShift(data: TimeSeriesPoint[], windowSize: number = 30, threshold: number = 2): AnomalyDetectionResult {
    const values = data.map(d => d.value);
    const anomalies: AnomalyPoint[] = [];

    for (let i = windowSize * 2; i < values.length; i++) {
      const before = values.slice(i - windowSize * 2, i - windowSize);
      const after = values.slice(i - windowSize, i);
      const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
      const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

      const allValues = [...before, ...after];
      const std = Math.sqrt(allValues.reduce((acc, v) => acc + (v - (meanBefore + meanAfter) / 2) ** 2, 0) / allValues.length);
      const shiftScore = std !== 0 ? Math.abs(meanAfter - meanBefore) / std : 0;

      if (shiftScore > threshold) {
        anomalies.push({
          index: i - windowSize,
          timestamp: data[i - windowSize].timestamp,
          value: meanAfter,
          expectedValue: meanBefore,
          deviation: meanAfter - meanBefore,
          score: shiftScore,
          type: 'level_shift',
          severity: shiftScore > threshold * 2 ? 'critical' : 'high'
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'level_shift',
      totalPoints: values.length,
      anomalyRate: anomalies.length / values.length,
      severity: this.aggregateSeverity(anomalies)
    };
  }

  private classifyAnomaly(values: number[], index: number, window: number): AnomalyPoint['type'] {
    if (index < window + 2) return 'spike';
    const prevTrend = values[index - 1] - values[index - window];
    const currentTrend = values[index] - values[index - 1];
    if (Math.sign(prevTrend) !== Math.sign(currentTrend) && Math.abs(currentTrend) > Math.abs(prevTrend) * 2) {
      return 'trend_change';
    }
    return values[index] > values[index - 1] ? 'spike' : 'drop';
  }

  private aggregateSeverity(anomalies: AnomalyPoint[]): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalies.length === 0) return 'low';
    const hasCritical = anomalies.some(a => a.severity === 'critical');
    const hasHigh = anomalies.some(a => a.severity === 'high');
    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (anomalies.length > 3) return 'medium';
    return 'low';
  }
}

export class ProphetPredictorService {
  private prophet: ProphetPredictor;
  private arima: SimpleARIMA;
  private anomalyDetector: AnomalyDetector;

  constructor() {
    this.prophet = new ProphetPredictor();
    this.arima = new SimpleARIMA();
    this.anomalyDetector = new AnomalyDetector();
    console.log('🔮 预见·先知 Prophet Predictor Service initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<{
    prediction: ForecastResult;
    anomalyDetection?: AnomalyDetectionResult;
    seasonalDecomposition?: SeasonalDecomposition;
    recommendations: string[];
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const data = (request.context?.data || []) as TimeSeriesPoint[];
    const horizon = request.context?.horizon || 30;
    const enableAnomaly = request.context?.enableAnomaly !== false;

    console.log(`🔮 [Prophet] Forecasting ${data.length} points, horizon: ${horizon}`);

    const prophetResult = this.prophet.fitPredict(data, horizon);

    const arimaResult = this.arima.fitPredict(
      data.map(d => d.value),
      horizon
    );

    const blendedForecast = this.blendForecasts(
      prophetResult.yhat,
      arimaResult.forecast
    );

    const blendedLower = this.blendForecasts(
      prophetResult.yhatLower,
      arimaResult.confidenceLower
    );

    const blendedUpper = this.blendForecasts(
      prophetResult.yhatUpper,
      arimaResult.confidenceUpper
    );

    const accuracy = this.backtestAccuracy(data.map(d => d.value));

    let anomalyResult: AnomalyDetectionResult | undefined;
    if (enableAnomaly && data.length > 10) {
      anomalyResult = this.anomalyDetector.detectMovingAverage(data);
    }

    const recommendations = this.generateRecommendations(
      blendedForecast,
      accuracy,
      anomalyResult
    );

    const predicted: TimeSeriesPoint[] = blendedForecast.map((v, i) => ({
      timestamp: prophetResult.ds[i],
      value: v
    }));

    const confidenceUpper: TimeSeriesPoint[] = blendedUpper.map((v, i) => ({
      timestamp: prophetResult.ds[i],
      value: v
    }));

    const confidenceLower: TimeSeriesPoint[] = blendedLower.map((v, i) => ({
      timestamp: prophetResult.ds[i],
      value: v
    }));

    return {
      prediction: {
        predicted,
        confidenceUpper,
        confidenceLower,
        confidenceLevel: 0.95,
        model: 'Prophet+ARIMA_Ensemble',
        accuracy,
        metadata: {
          trainingPoints: data.length,
          forecastHorizon: horizon,
          processingTimeMs: Date.now() - startTime
        }
      },
      anomalyDetection: anomalyResult,
      recommendations,
      processingTimeMs: Date.now() - startTime
    };
  }

  private blendForecasts(prophet: number[], arima: number[]): number[] {
    const len = Math.min(prophet.length, arima.length);
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      const w = Math.max(0.3, 0.7 - i * 0.02);
      result.push(prophet[i] * w + arima[i] * (1 - w));
    }
    return result;
  }

  private backtestAccuracy(values: number[]): ForecastAccuracy {
    if (values.length < 10) {
      return { mape: 0, mae: 0, rmse: 0, mase: 0, r2: 0 };
    }

    const trainSize = Math.floor(values.length * 0.8);
    const train = values.slice(0, trainSize);
    const test = values.slice(trainSize);

    const naive: number[] = [];
    for (let i = 0; i < test.length; i++) {
      naive.push(train[train.length - 1] + (i / test.length) * (test[test.length - 1] - train[train.length - 1]));
    }

    const errors = test.map((v, i) => v - naive[i]);
    const absErrors = errors.map(Math.abs);
    const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
    const mape = test.reduce((acc, v, i) => acc + (v !== 0 ? Math.abs(errors[i]) / Math.abs(v) : 0), 0) / test.length;
    const rmse = Math.sqrt(errors.reduce((acc, e) => acc + e * e, 0) / errors.length);

    const naiveErrors = test.map((v, i) => i > 0 ? Math.abs(v - test[i - 1]) : 0);
    const naiveMAE = naiveErrors.reduce((a, b) => a + b, 0) / (naiveErrors.length - 1 || 1);
    const mase = naiveMAE !== 0 ? mae / naiveMAE : 0;

    const testMean = test.reduce((a, b) => a + b, 0) / test.length;
    const ssTot = test.reduce((acc, v) => acc + (v - testMean) ** 2, 0);
    const ssRes = errors.reduce((acc, e) => acc + e * e, 0);
    const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

    return { mape, mae, rmse, mase, r2 };
  }

  private generateRecommendations(
    forecast: number[],
    accuracy: ForecastAccuracy,
    anomaly?: AnomalyDetectionResult
  ): string[] {
    const recs: string[] = [];

    if (forecast.length >= 2) {
      const trend = forecast[forecast.length - 1] - forecast[0];
      if (trend > 0) recs.push(`预测趋势向上，累计变化 ${trend.toFixed(2)}，建议关注做多机会`);
      else if (trend < 0) recs.push(`预测趋势向下，累计变化 ${trend.toFixed(2)}，建议注意下行风险`);
      else recs.push('预测趋势平稳，建议维持当前策略');
    }

    if (accuracy.mape > 0.1) recs.push(`预测误差较大 (MAPE: ${(accuracy.mape * 100).toFixed(1)}%)，建议增加训练数据`);
    if (accuracy.r2 > 0.8) recs.push('模型拟合优度较高，预测结果可信度较好');

    if (anomaly && anomaly.anomalies.length > 0) {
      recs.push(`检测到 ${anomaly.anomalies.length} 个异常点 (${(anomaly.anomalyRate * 100).toFixed(1)}%)，需关注`);
      if (anomaly.severity === 'critical') recs.push('⚠️ 异常严重程度为"危急"，建议立即排查原因');
    }

    return recs;
  }
}

let prophetInstance: ProphetPredictorService | null = null;

export function getProphetPredictorService(): ProphetPredictorService {
  if (!prophetInstance) {
    prophetInstance = new ProphetPredictorService();
  }
  return prophetInstance;
}
