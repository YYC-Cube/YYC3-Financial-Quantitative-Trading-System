import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface CodeQualityMetrics {
  overall: number;
  breakdown: {
    typeSafety: number;
    complexity: number;
    maintainability: number;
    performance: number;
    bestPractices: number;
    documentation: number;
  };
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CodeIssue {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  line?: number;
  column?: number;
  rule: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface ArchitectureAnalysis {
  modularity: number;
  coupling: number;
  cohesion: number;
  dependencyCount: number;
  circularDependencies: string[];
  layerViolationCount: number;
  recommendations: string[];
}

export interface PerformanceAssessment {
  bundleSizeEstimate: number;
  estimatedLoadTime: number;
  renderComplexity: 'low' | 'medium' | 'high';
  memoryRiskLevel: 'low' | 'medium' | 'high';
  optimizationOpportunities: string[];
}

export interface QualityAuditReport {
  id: string;
  filePath: string;
  metrics: CodeQualityMetrics;
  issues: CodeIssue[];
  architecture: ArchitectureAnalysis;
  performance: PerformanceAssessment;
  suggestions: string[];
  overallScore: number;
  auditedAt: Date;
  processingTimeMs: number;
}

export class GrandmasterQualityAuditor {
  private auditHistory: Map<string, QualityAuditReport[]> = new Map();

  constructor() {
    console.log('📚 格物·宗师 Grandmaster Quality Auditor initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<{
    report: QualityAuditReport;
    previousReports: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const filePath = request.context?.filePath || request.userInput;
    const code = request.context?.code || '';
    const language = request.context?.language || 'typescript';

    const metrics = this.analyzeCodeQuality(code, language);
    const issues = this.detectIssues(code, language);
    const architecture = this.analyzeArchitecture(code, language);
    const performance = this.assessPerformance(code, language);
    const suggestions = this.generateSuggestions(metrics, issues, architecture, performance);

    const report: QualityAuditReport = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      filePath,
      metrics,
      issues,
      architecture,
      performance,
      suggestions,
      overallScore: metrics.overall,
      auditedAt: new Date(),
      processingTimeMs: Date.now() - startTime
    };

    this.recordAudit(filePath, report);

    console.log(`📚 [Grandmaster] Audit complete: ${filePath} → Grade ${metrics.grade} (${metrics.overall.toFixed(1)}/100)`);

    return {
      report,
      previousReports: (this.auditHistory.get(filePath)?.length || 1) - 1,
      processingTimeMs: Date.now() - startTime
    };
  }

  getAuditHistory(filePath: string): QualityAuditReport[] {
    return this.auditHistory.get(filePath) || [];
  }

  getPerformanceTrend(filePath: string): 'improving' | 'stable' | 'degrading' | 'unknown' {
    const history = this.auditHistory.get(filePath);
    if (!history || history.length < 2) return 'unknown';
    const recent = history.slice(-5);
    const scores = recent.map(r => r.overallScore);
    const trend = scores[scores.length - 1] - scores[0];
    if (trend > 5) return 'improving';
    if (trend < -5) return 'degrading';
    return 'stable';
  }

  private analyzeCodeQuality(code: string, language: string): CodeQualityMetrics {
    if (!code) return this.defaultMetrics();

    const lines = code.split('\n');
    const totalLines = lines.length;
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*')).length;
    const commentLines = totalLines - codeLines;

    const typeSafety = this.scoreTypeSafety(code, language);
    const complexity = this.scoreComplexity(code);
    const maintainability = this.scoreMaintainability(code, codeLines, commentLines);
    const performance = this.scorePerformance(code);
    const bestPractices = this.scoreBestPractices(code, language);
    const documentation = Math.min(100, (commentLines / Math.max(codeLines, 1)) * 200);

    const overall = typeSafety * 0.2 + complexity * 0.15 + maintainability * 0.2 +
      performance * 0.15 + bestPractices * 0.2 + documentation * 0.1;

    let grade: CodeQualityMetrics['grade'] = 'F';
    if (overall >= 95) grade = 'A+';
    else if (overall >= 85) grade = 'A';
    else if (overall >= 70) grade = 'B';
    else if (overall >= 55) grade = 'C';
    else if (overall >= 40) grade = 'D';

    return {
      overall,
      breakdown: { typeSafety, complexity, maintainability, performance, bestPractices, documentation },
      grade
    };
  }

  private scoreTypeSafety(code: string, language: string): number {
    let score = 70;
    if (language === 'typescript') {
      if (!code.includes(': any')) score += 15;
      else score -= code.split(': any').length * 5;
      if (code.includes('interface ') || code.includes('type ')) score += 10;
      if (code.includes('as unknown')) score -= 5;
      if (code.includes('!.')) score -= 3;
    }
    return Math.max(0, Math.min(100, score));
  }

  private scoreComplexity(code: string): number {
    let score = 80;
    const _nestingMatch = code.match(/\{/g);
    const maxNesting = this.estimateMaxNesting(code);
    if (maxNesting > 5) score -= (maxNesting - 5) * 10;
    if (maxNesting > 3) score -= 5;

    const functionCount = (code.match(/function\s|=>\s|async\s/g) || []).length;
    if (functionCount > 20) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private scoreMaintainability(code: string, codeLines: number, _commentLines: number): number {
    let score = 75;
    const avgLineLength = code.split('\n').reduce((sum, l) => sum + l.length, 0) / Math.max(code.split('\n').length, 1);
    if (avgLineLength > 120) score -= 15;
    else if (avgLineLength > 80) score -= 5;

    if (codeLines < 500) score += 10;
    else if (codeLines > 1000) score -= 15;

    const importCount = (code.match(/^import /gm) || []).length;
    if (importCount > 15) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private scorePerformance(code: string): number {
    let score = 80;
    if (code.includes('useMemo') || code.includes('useCallback')) score += 5;
    if (code.includes('React.memo')) score += 5;
    if (code.includes('.forEach(') && code.includes('await')) score -= 10;
    if (code.includes('JSON.parse') && !code.includes('try')) score -= 5;
    if (code.includes('console.log')) score -= 3;
    if (code.includes('localStorage') && !code.includes('try')) score -= 5;
    return Math.max(0, Math.min(100, score));
  }

  private scoreBestPractices(code: string, language: string): number {
    let score = 75;
    if (code.includes('try') && code.includes('catch')) score += 10;
    if (code.includes('export')) score += 5;
    if (code.includes('readonly')) score += 5;
    if (language === 'typescript' && code.includes('enum ')) score += 3;
    if (code.includes('TODO') || code.includes('FIXME')) score -= 5;
    if (code.includes('eval(')) score -= 20;
    if (code.includes('innerHTML')) score -= 15;
    return Math.max(0, Math.min(100, score));
  }

  private detectIssues(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      if (/: any\b/.test(line) && language === 'typescript') {
        issues.push({
          id: `issue_${index}_any`,
          severity: 'warning',
          category: 'type_safety',
          message: '避免使用 any 类型',
          line: index + 1,
          rule: 'no-explicit-any',
          suggestion: '使用具体类型或 unknown 替代',
          autoFixable: false
        });
      }

      if (/\beval\s*\(/.test(line)) {
        issues.push({
          id: `issue_${index}_eval`,
          severity: 'critical',
          category: 'security',
          message: '禁止使用 eval()',
          line: index + 1,
          rule: 'no-eval',
          suggestion: '使用 JSON.parse 或 Function 构造器替代',
          autoFixable: false
        });
      }

      if (line.length > 150) {
        issues.push({
          id: `issue_${index}_len`,
          severity: 'warning',
          category: 'style',
          message: `行长度 ${line.length} 超过建议上限 120`,
          line: index + 1,
          rule: 'max-len',
          suggestion: '拆分长行',
          autoFixable: true
        });
      }

      if (/console\.(log|warn|error|debug)\(/.test(line)) {
        issues.push({
          id: `issue_${index}_console`,
          severity: 'info',
          category: 'best_practice',
          message: '生产代码中应避免 console 语句',
          line: index + 1,
          rule: 'no-console',
          suggestion: '使用日志库替代',
          autoFixable: true
        });
      }
    });

    if (!code.includes('try') && (code.includes('await ') || code.includes('.fetch('))) {
      issues.push({
        id: 'issue_async_no_try',
        severity: 'error',
        category: 'error_handling',
        message: '异步操作缺少错误处理',
        rule: 'require-try-catch',
        suggestion: '在异步操作外包裹 try-catch',
        autoFixable: false
      });
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private analyzeArchitecture(code: string, _language: string): ArchitectureAnalysis {
    const imports = (code.match(/^import .+ from .+$/gm) || []).length;
    const exports = (code.match(/^export /gm) || []).length;

    const circularDeps: string[] = [];
    if (imports > 20) circularDeps.push('Potential circular dependency (high import count)');

    return {
      modularity: Math.min(100, exports * 10 + 50),
      coupling: Math.max(0, 100 - imports * 5),
      cohesion: imports > 0 ? Math.min(100, (exports / imports) * 100) : 50,
      dependencyCount: imports,
      circularDependencies: circularDeps,
      layerViolationCount: 0,
      recommendations: imports > 15 ? ['考虑拆分模块，减少依赖数'] : []
    };
  }

  private assessPerformance(code: string, _language: string): PerformanceAssessment {
    const lines = code.split('\n').length;
    const bundleEstimate = lines * 40;
    const hasLazyLoading = code.includes('lazy(') || code.includes('import(');
    const hasMemoization = code.includes('useMemo') || code.includes('memo');

    const opportunities: string[] = [];
    if (!hasLazyLoading && lines > 200) opportunities.push('建议使用代码分割 (React.lazy)');
    if (!hasMemoization && code.includes('.map(')) opportunities.push('建议使用 useMemo 优化列表渲染');
    if (code.includes('.filter(') && code.includes('.map(')) opportunities.push('建议合并 filter+map 为 reduce');

    return {
      bundleSizeEstimate,
      estimatedLoadTime: bundleEstimate / 10000,
      renderComplexity: lines > 300 ? 'high' : lines > 100 ? 'medium' : 'low',
      memoryRiskLevel: code.includes('setInterval') && !code.includes('clearInterval') ? 'high' : 'low',
      optimizationOpportunities: opportunities
    };
  }

  private generateSuggestions(
    metrics: CodeQualityMetrics,
    issues: CodeIssue[],
    architecture: ArchitectureAnalysis,
    performance: PerformanceAssessment
  ): string[] {
    const suggestions: string[] = [];

    if (metrics.breakdown.typeSafety < 70) suggestions.push('加强类型安全：减少 any 使用，增加接口定义');
    if (metrics.breakdown.documentation < 50) suggestions.push('增加文档注释覆盖率');
    if (issues.filter(i => i.severity === 'critical').length > 0) suggestions.push('立即修复严重级别问题');
    if (architecture.coupling < 60) suggestions.push('降低模块耦合度，考虑依赖注入');
    if (performance.memoryRiskLevel === 'high') suggestions.push('检查定时器和事件监听器是否正确清理');
    if (suggestions.length === 0) suggestions.push('代码质量良好，继续保持！');

    return suggestions;
  }

  private estimateMaxNesting(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of code) {
      if (char === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth); }
      if (char === '}') currentDepth = Math.max(0, currentDepth - 1);
    }
    return maxDepth;
  }

  private defaultMetrics(): CodeQualityMetrics {
    return {
      overall: 0,
      breakdown: { typeSafety: 0, complexity: 0, maintainability: 0, performance: 0, bestPractices: 0, documentation: 0 },
      grade: 'F'
    };
  }

  private recordAudit(filePath: string, report: QualityAuditReport): void {
    if (!this.auditHistory.has(filePath)) this.auditHistory.set(filePath, []);
    const history = this.auditHistory.get(filePath)!;
    history.push(report);
    if (history.length > 50) this.auditHistory.set(filePath, history.slice(-25));
  }
}

let grandmasterInstance: GrandmasterQualityAuditor | null = null;

export function getGrandmasterQualityAuditor(): GrandmasterQualityAuditor {
  if (!grandmasterInstance) {
    grandmasterInstance = new GrandmasterQualityAuditor();
  }
  return grandmasterInstance;
}
