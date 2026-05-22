import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  volume?: number;
  metadata?: Record<string, any>;
}

export interface ChartDataset {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'candlestick' | 'area' | 'scatter';
  data: ChartDataPoint[];
  unit?: string;
  color?: string;
}

export interface ParsedChartResult {
  datasets: ChartDataset[];
  timeRange: { start: number; end: number };
  granularity: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';
  totalPoints: number;
  parsedAt: Date;
}

export interface StatisticalIndicators {
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  range: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
  coefficientOfVariation: number;
  sampleSize: number;
}

export interface FinancialIndicators {
  returns: number[];
  cumulativeReturn: number;
  annualizedReturn: number;
  volatility: number;
  annualizedVolatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  calmarRatio: number;
  winRate: number;
  profitLossRatio: number;
  valueAtRisk95: number;
  conditionalVaR95: number;
}

export interface TrendAnalysis {
  direction: 'upward' | 'downward' | 'sideways';
  strength: number;
  slope: number;
  r2: number;
  supportLevel: number;
  resistanceLevel: number;
  movingAverages: {
    sma5: number[];
    sma10: number[];
    sma20: number[];
    sma50: number[];
    ema12: number[];
    ema26: number[];
  };
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
}

export interface CorrelationAnalysis {
  pairs: { assetA: string; assetB: string; correlation: number }[];
  matrix: number[][];
  labels: string[];
}

export interface ReportSection {
  title: string;
  type: 'summary' | 'statistics' | 'trend' | 'comparison' | 'risk' | 'recommendation';
  content: string;
  data?: any;
  charts?: ChartDataset[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AnalysisReport {
  id: string;
  title: string;
  generatedAt: Date;
  author: string;
  sections: ReportSection[];
  executiveSummary: string;
  keyFindings: string[];
  riskWarnings: string[];
  confidence: number;
  metadata: {
    dataPoints: number;
    timeRange: { start: Date; end: Date };
    processingTimeMs: number;
  };
}

export interface YuShuAnalysisRequest {
  userId: string;
  data: ChartDataPoint[] | ChartDataset[];
  analysisTypes: AnalysisType[];
  options?: {
    includeReport?: boolean;
    reportFormat?: 'brief' | 'detailed' | 'comprehensive';
    language?: 'zh-CN' | 'en-US';
    comparisonBaseline?: ChartDataPoint[];
  };
}

export enum AnalysisType {
  STATISTICAL = 'statistical',
  FINANCIAL = 'financial',
  TREND = 'trend',
  CORRELATION = 'correlation',
  COMPARISON = 'comparison',
  RISK = 'risk',
  COMPREHENSIVE = 'comprehensive'
}

export class YuShuAnalysisEngine {
  private analysisCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    console.log('🤔 语枢·万物 YuShu Analysis Engine initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<{
    analysisType: string;
    results: any;
    report?: AnalysisReport;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const data = request.context?.data || [];
    const analysisTypes = request.context?.analysisTypes || [AnalysisType.STATISTICAL];

    console.log(`📊 [YuShu] Analyzing ${Array.isArray(data) ? data.length : 0} data points`);

    const results: Record<string, any> = {};

    for (const type of analysisTypes) {
      switch (type) {
        case AnalysisType.STATISTICAL:
          results.statistical = this.calculateStatisticalIndicators(data);
          break;
        case AnalysisType.FINANCIAL:
          results.financial = this.calculateFinancialIndicators(data);
          break;
        case AnalysisType.TREND:
          results.trend = this.analyzeTrend(data);
          break;
        case AnalysisType.CORRELATION:
          results.correlation = this.analyzeCorrelation(request.context?.datasets || []);
          break;
        case AnalysisType.RISK:
          results.risk = this.assessRisk(data);
          break;
        case AnalysisType.COMPREHENSIVE:
          results.statistical = this.calculateStatisticalIndicators(data);
          results.financial = this.calculateFinancialIndicators(data);
          results.trend = this.analyzeTrend(data);
          results.risk = this.assessRisk(data);
          break;
      }
    }

    let report: AnalysisReport | undefined;
    if (request.context?.includeReport !== false) {
      report = this.generateReport(results, request, Date.now() - startTime);
    }

    return {
      analysisType: analysisTypes.join(','),
      results,
      report,
      processingTimeMs: Date.now() - startTime
    };
  }

  parseChartData(raw: any[]): ParsedChartResult {
    if (!Array.isArray(raw) || raw.length === 0) {
      return {
        datasets: [],
        timeRange: { start: 0, end: 0 },
        granularity: '1d',
        totalPoints: 0,
        parsedAt: new Date()
      };
    }

    const points: ChartDataPoint[] = raw.map(item => ({
      timestamp: item.timestamp || item.date || item.t || Date.now(),
      value: Number(item.value || item.price || item.close || item.v || 0),
      volume: item.volume ? Number(item.volume) : undefined,
      metadata: item.metadata || {}
    }));

    points.sort((a, b) => a.timestamp - b.timestamp);

    const granularity = this.detectGranularity(points);

    return {
      datasets: [{
        id: 'parsed_dataset',
        name: 'Parsed Data',
        type: 'line',
        data: points,
        unit: 'USD'
      }],
      timeRange: {
        start: points[0].timestamp,
        end: points[points.length - 1].timestamp
      },
      granularity,
      totalPoints: points.length,
      parsedAt: new Date()
    };
  }

  calculateStatisticalIndicators(data: ChartDataPoint[]): StatisticalIndicators {
    const values = this.extractValues(data);
    if (values.length === 0) {
      return this.emptyStatisticalIndicators();
    }

    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);

    const skewness = values.reduce((acc, v) => acc + Math.pow((v - mean) / standardDeviation, 3), 0) / n;
    const kurtosis = values.reduce((acc, v) => acc + Math.pow((v - mean) / standardDeviation, 4), 0) / n - 3;

    const mode = this.calculateMode(values);

    return {
      mean,
      median: this.percentile(sorted, 50),
      mode,
      standardDeviation,
      variance,
      skewness,
      kurtosis,
      min: sorted[0],
      max: sorted[n - 1],
      range: sorted[n - 1] - sorted[0],
      percentile25: this.percentile(sorted, 25),
      percentile50: this.percentile(sorted, 50),
      percentile75: this.percentile(sorted, 75),
      percentile90: this.percentile(sorted, 90),
      percentile95: this.percentile(sorted, 95),
      coefficientOfVariation: mean !== 0 ? standardDeviation / Math.abs(mean) : 0,
      sampleSize: n
    };
  }

  calculateFinancialIndicators(data: ChartDataPoint[]): FinancialIndicators {
    const values = this.extractValues(data);
    if (values.length < 2) {
      return this.emptyFinancialIndicators();
    }

    const returns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    const cumulativeReturn = (values[values.length - 1] - values[0]) / values[0];
    const annualizedReturn = Math.pow(1 + cumulativeReturn, 252 / values.length) - 1;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnVariance = returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(returnVariance);
    const annualizedVolatility = volatility * Math.sqrt(252);

    const riskFreeRate = 0.02 / 252;
    const sharpeRatio = volatility !== 0 ? (avgReturn - riskFreeRate) / volatility : 0;

    const negativeReturns = returns.filter(r => r < 0);
    const downsideVol = negativeReturns.length > 0
      ? Math.sqrt(negativeReturns.reduce((acc, r) => acc + r * r, 0) / negativeReturns.length)
      : 0;
    const sortinoRatio = downsideVol !== 0 ? (avgReturn - riskFreeRate) / downsideVol : 0;

    let maxDrawdown = 0;
    let peak = values[0];
    let maxDDStart = 0;
    let maxDDEnd = 0;
    let currentStart = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
        currentStart = i;
      }
      const dd = (peak - values[i]) / peak;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDDStart = currentStart;
        maxDDEnd = i;
      }
    }

    const maxDrawdownDuration = maxDDEnd - maxDDStart;
    const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / maxDrawdown : 0;

    const positiveReturns = returns.filter(r => r > 0);
    const winRate = positiveReturns.length / returns.length;
    const avgWin = positiveReturns.length > 0 ? positiveReturns.reduce((a, b) => a + b, 0) / positiveReturns.length : 0;
    const avgLoss = negativeReturns.length > 0 ? Math.abs(negativeReturns.reduce((a, b) => a + b, 0) / negativeReturns.length) : 0;
    const profitLossRatio = avgLoss !== 0 ? avgWin / avgLoss : 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    const valueAtRisk95 = sortedReturns[varIndex];
    const tailReturns = sortedReturns.slice(0, varIndex);
    const conditionalVaR95 = tailReturns.length > 0
      ? tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length
      : valueAtRisk95;

    return {
      returns,
      cumulativeReturn,
      annualizedReturn,
      volatility,
      annualizedVolatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      maxDrawdownDuration,
      calmarRatio,
      winRate,
      profitLossRatio,
      valueAtRisk95,
      conditionalVaR95
    };
  }

  analyzeTrend(data: ChartDataPoint[]): TrendAnalysis {
    const values = this.extractValues(data);
    if (values.length < 2) {
      return this.emptyTrendAnalysis();
    }

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const yMean = sumY / n;
    const ssTot = values.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssRes = values.reduce((acc, y, i) => acc + Math.pow(y - (slope * i + intercept), 2), 0);
    const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

    let direction: TrendAnalysis['direction'] = 'sideways';
    if (slope > 0.001) direction = 'upward';
    else if (slope < -0.001) direction = 'downward';

    const strength = Math.min(Math.abs(slope) / (yMean !== 0 ? Math.abs(yMean) : 1) * 100, 1);

    const sma = (period: number): number[] => {
      const result: number[] = [];
      for (let i = 0; i < values.length; i++) {
        if (i < period - 1) { result.push(NaN); continue; }
        const slice = values.slice(i - period + 1, i + 1);
        result.push(slice.reduce((a, b) => a + b, 0) / period);
      }
      return result;
    };

    const ema = (period: number): number[] => {
      const result: number[] = [];
      const k = 2 / (period + 1);
      result.push(values[0]);
      for (let i = 1; i < values.length; i++) {
        result.push(values[i] * k + result[i - 1] * (1 - k));
      }
      return result;
    };

    const ema12 = ema(12);
    const ema26 = ema(26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = this.calculateEMAFromArray(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    const recent = values.slice(-20);
    const supportLevel = Math.min(...recent);
    const resistanceLevel = Math.max(...recent);

    return {
      direction,
      strength,
      slope,
      r2,
      supportLevel,
      resistanceLevel,
      movingAverages: {
        sma5: sma(5),
        sma10: sma(10),
        sma20: sma(20),
        sma50: sma(50),
        ema12,
        ema26
      },
      macd: { macdLine, signalLine, histogram }
    };
  }

  analyzeCorrelation(datasets: ChartDataset[]): CorrelationAnalysis {
    if (!datasets || datasets.length < 2) {
      return { pairs: [], matrix: [[]], labels: [] };
    }

    const alignedData = this.alignDatasets(datasets);
    const labels = datasets.map(d => d.name);
    const n = datasets.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    const pairs: CorrelationAnalysis['pairs'] = [];

    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        const corr = this.pearsonCorrelation(alignedData[i], alignedData[j]);
        matrix[i][j] = corr;
        matrix[j][i] = corr;
        pairs.push({
          assetA: labels[i],
          assetB: labels[j],
          correlation: corr
        });
      }
    }

    return { pairs, matrix, labels };
  }

  assessRisk(data: ChartDataPoint[]): {
    overallRisk: 'low' | 'medium' | 'high' | 'extreme';
    riskScore: number;
    volatilityRisk: number;
    drawdownRisk: number;
    liquidityRisk: number;
    concentrationRisk: number;
    recommendations: string[];
  } {
    const _values = this.extractValues(data);
    const financial = this.calculateFinancialIndicators(data);
    const statistical = this.calculateStatisticalIndicators(data);

    const volatilityRisk = Math.min(financial.annualizedVolatility / 0.5, 1);
    const drawdownRisk = Math.min(financial.maxDrawdown / 0.3, 1);

    const volumes = data.map(d => d.volume || 0).filter(v => v > 0);
    const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 1;
    const recentVolume = volumes.slice(-5);
    const recentAvg = recentVolume.length > 0 ? recentVolume.reduce((a, b) => a + b, 0) / recentVolume.length : avgVolume;
    const liquidityRisk = avgVolume > 0 ? Math.max(0, 1 - recentAvg / avgVolume) : 0.5;

    const concentrationRisk = statistical.coefficientOfVariation > 0.5 ? 0.7 : 0.3;

    const riskScore = (volatilityRisk * 0.3 + drawdownRisk * 0.3 + liquidityRisk * 0.2 + concentrationRisk * 0.2);

    let overallRisk: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    if (riskScore >= 0.75) overallRisk = 'extreme';
    else if (riskScore >= 0.5) overallRisk = 'high';
    else if (riskScore >= 0.25) overallRisk = 'medium';

    const recommendations: string[] = [];
    if (volatilityRisk > 0.5) recommendations.push('建议降低仓位规模以控制波动率风险');
    if (drawdownRisk > 0.5) recommendations.push('建议设置更严格的止损策略');
    if (liquidityRisk > 0.5) recommendations.push('注意流动性风险，避免大额交易');
    if (financial.sharpeRatio < 0.5) recommendations.push('当前风险调整后收益偏低，考虑优化策略');
    if (recommendations.length === 0) recommendations.push('当前风险水平可控，维持现有策略');

    return {
      overallRisk,
      riskScore,
      volatilityRisk,
      drawdownRisk,
      liquidityRisk,
      concentrationRisk,
      recommendations
    };
  }

  generateReport(
    results: Record<string, any>,
    request: FamilyOrchestrationRequest,
    processingTimeMs: number
  ): AnalysisReport {
    const sections: ReportSection[] = [];
    const keyFindings: string[] = [];
    const riskWarnings: string[] = [];

    if (results.statistical) {
      const s = results.statistical as StatisticalIndicators;
      sections.push({
        title: '📊 统计指标概览',
        type: 'statistics',
        content: `数据样本量: ${s.sampleSize} | 均值: ${s.mean.toFixed(4)} | 标准差: ${s.standardDeviation.toFixed(4)} | 偏度: ${s.skewness.toFixed(4)} | 峰度: ${s.kurtosis.toFixed(4)}`,
        data: s,
        priority: 'high'
      });
      keyFindings.push(`数据均值为 ${s.mean.toFixed(2)}，波动范围 ${s.min.toFixed(2)} ~ ${s.max.toFixed(2)}`);
      if (Math.abs(s.skewness) > 1) keyFindings.push(`数据分布呈现明显${s.skewness > 0 ? '右' : '左'}偏`);
    }

    if (results.financial) {
      const f = results.financial as FinancialIndicators;
      sections.push({
        title: '💰 金融绩效指标',
        type: 'statistics',
        content: `累计收益: ${(f.cumulativeReturn * 100).toFixed(2)}% | 年化收益: ${(f.annualizedReturn * 100).toFixed(2)}% | 夏普比率: ${f.sharpeRatio.toFixed(4)} | 最大回撤: ${(f.maxDrawdown * 100).toFixed(2)}%`,
        data: f,
        priority: 'critical'
      });
      keyFindings.push(`年化收益率 ${(f.annualizedReturn * 100).toFixed(2)}%，夏普比率 ${f.sharpeRatio.toFixed(2)}`);
      if (f.maxDrawdown > 0.2) riskWarnings.push(`最大回撤达 ${(f.maxDrawdown * 100).toFixed(2)}%，需关注下行风险`);
      if (f.sharpeRatio < 1) riskWarnings.push(`夏普比率 ${f.sharpeRatio.toFixed(2)} 低于理想水平(>1.0)`);
    }

    if (results.trend) {
      const t = results.trend as TrendAnalysis;
      const dirMap = { upward: '上升', downward: '下降', sideways: '横盘' };
      sections.push({
        title: '📈 趋势分析',
        type: 'trend',
        content: `趋势方向: ${dirMap[t.direction]} | 强度: ${(t.strength * 100).toFixed(1)}% | 支撑位: ${t.supportLevel.toFixed(2)} | 阻力位: ${t.resistanceLevel.toFixed(2)} | R²: ${t.r2.toFixed(4)}`,
        data: t,
        priority: 'high'
      });
      keyFindings.push(`当前趋势呈${dirMap[t.direction]}态势，强度 ${(t.strength * 100).toFixed(1)}%`);
    }

    if (results.risk) {
      const r = results.risk;
      sections.push({
        title: '⚠️ 风险评估',
        type: 'risk',
        content: `综合风险: ${r.overallRisk} (${(r.riskScore * 100).toFixed(1)}分) | 波动率风险: ${(r.volatilityRisk * 100).toFixed(1)}% | 回撤风险: ${(r.drawdownRisk * 100).toFixed(1)}%`,
        data: r,
        priority: r.overallRisk === 'extreme' || r.overallRisk === 'high' ? 'critical' : 'medium'
      });
      r.recommendations.forEach((rec: string) => keyFindings.push(rec));
    }

    const executiveSummary = this.generateExecutiveSummary(results, keyFindings, riskWarnings);

    return {
      id: `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: `数据分析报告 - ${new Date().toLocaleDateString('zh-CN')}`,
      generatedAt: new Date(),
      author: '语枢·万物 YuShu',
      sections,
      executiveSummary,
      keyFindings,
      riskWarnings,
      confidence: results.statistical ? Math.min(0.95, 0.7 + results.statistical.sampleSize * 0.001) : 0.7,
      metadata: {
        dataPoints: results.statistical?.sampleSize || 0,
        timeRange: { start: new Date(), end: new Date() },
        processingTimeMs
      }
    };
  }

  private generateExecutiveSummary(
    results: Record<string, any>,
    keyFindings: string[],
    riskWarnings: string[]
  ): string {
    let summary = '## 数据分析摘要\n\n';

    if (results.financial) {
      const f = results.financial as FinancialIndicators;
      summary += `本期累计收益率为 **${(f.cumulativeReturn * 100).toFixed(2)}%**，`;
      summary += `年化波动率 **${(f.annualizedVolatility * 100).toFixed(2)}%**，`;
      summary += `夏普比率 **${f.sharpeRatio.toFixed(2)}**。\n\n`;
    }

    if (results.trend) {
      const t = results.trend as TrendAnalysis;
      const dirMap = { upward: '上升', downward: '下降', sideways: '横盘' };
      summary += `当前市场趋势呈 **${dirMap[t.direction]}** 态势，趋势强度 ${(t.strength * 100).toFixed(1)}%。\n\n`;
    }

    if (keyFindings.length > 0) {
      summary += '### 关键发现\n';
      keyFindings.forEach(f => { summary += `- ${f}\n`; });
      summary += '\n';
    }

    if (riskWarnings.length > 0) {
      summary += '### ⚠️ 风险提示\n';
      riskWarnings.forEach(w => { summary += `- ${w}\n`; });
    }

    return summary;
  }

  private extractValues(data: ChartDataPoint[]): number[] {
    if (!Array.isArray(data)) return [];
    return data.map(d => typeof d === 'number' ? d : (d.value ?? (d as any).price ?? (d as any).close ?? 0));
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  private calculateMode(values: number[]): number[] {
    const freq = new Map<number, number>();
    values.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
    const maxFreq = Math.max(...freq.values());
    if (maxFreq === 1) return [];
    return [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v);
  }

  private detectGranularity(points: ChartDataPoint[]): ParsedChartResult['granularity'] {
    if (points.length < 2) return '1d';
    const avgInterval = (points[points.length - 1].timestamp - points[0].timestamp) / (points.length - 1);
    const minutes = avgInterval / 60000;
    if (minutes <= 1) return '1m';
    if (minutes <= 5) return '5m';
    if (minutes <= 15) return '15m';
    if (minutes <= 60) return '1h';
    if (minutes <= 240) return '4h';
    if (minutes <= 1440) return '1d';
    if (minutes <= 10080) return '1w';
    return '1M';
  }

  private calculateEMAFromArray(data: number[], period: number): number[] {
    const result: number[] = [];
    const k = 2 / (period + 1);
    result.push(data[0]);
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  }

  private alignDatasets(datasets: ChartDataset[]): number[][] {
    if (datasets.length === 0) return [];
    const allTimestamps = new Set<number>();
    datasets.forEach(ds => ds.data.forEach(p => allTimestamps.add(p.timestamp)));
    const sortedTs = [...allTimestamps].sort((a, b) => a - b);

    return datasets.map(ds => {
      const valueMap = new Map(ds.data.map(p => [p.timestamp, p.value]));
      return sortedTs.map(ts => valueMap.get(ts) ?? 0);
    });
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
  }

  private emptyStatisticalIndicators(): StatisticalIndicators {
    return {
      mean: 0, median: 0, mode: [], standardDeviation: 0, variance: 0,
      skewness: 0, kurtosis: 0, min: 0, max: 0, range: 0,
      percentile25: 0, percentile50: 0, percentile75: 0, percentile90: 0, percentile95: 0,
      coefficientOfVariation: 0, sampleSize: 0
    };
  }

  private emptyFinancialIndicators(): FinancialIndicators {
    return {
      returns: [], cumulativeReturn: 0, annualizedReturn: 0, volatility: 0,
      annualizedVolatility: 0, sharpeRatio: 0, sortinoRatio: 0, maxDrawdown: 0,
      maxDrawdownDuration: 0, calmarRatio: 0, winRate: 0, profitLossRatio: 0,
      valueAtRisk95: 0, conditionalVaR95: 0
    };
  }

  private emptyTrendAnalysis(): TrendAnalysis {
    return {
      direction: 'sideways', strength: 0, slope: 0, r2: 0,
      supportLevel: 0, resistanceLevel: 0,
      movingAverages: { sma5: [], sma10: [], sma20: [], sma50: [], ema12: [], ema26: [] },
      macd: { macdLine: [], signalLine: [], histogram: [] }
    };
  }
}

let yuShuInstance: YuShuAnalysisEngine | null = null;

export function getYuShuAnalysisEngine(): YuShuAnalysisEngine {
  if (!yuShuInstance) {
    yuShuInstance = new YuShuAnalysisEngine();
  }
  return yuShuInstance;
}
