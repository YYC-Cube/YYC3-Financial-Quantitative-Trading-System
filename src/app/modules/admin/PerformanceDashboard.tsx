/**
 * @file src/app/modules/admin/PerformanceDashboard.tsx
 * @description 性能仪表盘 - 实时监控请求延迟、熔断器状态、系统性能快照
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

import { useState, useEffect } from 'react';

import { getAllCircuitBreakerMetrics, type CircuitBreakerMetrics } from '@/app/api/circuit-breaker';
import { perfMonitor, type PerformanceSnapshot, type RequestLogEntry } from '@/app/api/performance-monitor';
import { Card } from '@/app/components/ui/card';

export const PerformanceDashboard = () => {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [cbMetrics, setCbMetrics] = useState<CircuitBreakerMetrics[]>([]);
  const [requestLog, setRequestLog] = useState<RequestLogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5);

  const refresh = () => {
    setSnapshot(perfMonitor.getSnapshot());
    setCbMetrics(getAllCircuitBreakerMetrics());
    setRequestLog(perfMonitor.getRequestLog(30));
  };

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const timer = setInterval(refresh, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  const formatMs = (ms: number) => ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(1)}s`;
  const formatUptime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const stateColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'text-[#38B2AC]';
      case 'OPEN': return 'text-[#F56565]';
      case 'HALF_OPEN': return 'text-[#ECC94B]';
      default: return 'text-[#8892B0]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">性能监控中心</h2>
        <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-3 py-1.5 text-xs rounded ${autoRefresh ? 'bg-[#38B2AC]' : 'bg-[#233554]'} text-white`}>
          {autoRefresh ? '⏸ 暂停刷新' : '▶ 启动刷新'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">平均响应时间</div>
          <div className="text-2xl font-bold text-white">{snapshot ? formatMs(snapshot.avgLatency) : '-'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">请求成功率</div>
          <div className="text-2xl font-bold text-[#38B2AC]">{snapshot ? `${(snapshot.successRate * 100).toFixed(1)}%` : '-'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">系统运行时间</div>
          <div className="text-lg font-bold text-white">{snapshot ? formatUptime(snapshot.uptime) : '-'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">活跃熔断器</div>
          <div className={`text-lg font-bold ${cbMetrics.some(m => m.state !== 'CLOSED') ? 'text-[#F56565]' : 'text-[#38B2AC]'}`}>
            {cbMetrics.filter(m => m.state !== 'CLOSED').length}/{cbMetrics.length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">最近请求日志</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {requestLog.slice(0, 15).map((log, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded text-xs ${log.success ? 'bg-[#065F46]/10' : 'bg-[#991B1B]/10'}`}>
                <span className={log.success ? 'text-[#38B2AC]' : 'text-[#F56565]'}>{log.success ? '✓' : '✗'}</span>
                <span className="text-[#CCD6F6] flex-1 mx-2 truncate">{log.endpoint}</span>
                <span className="text-[#8892B0]">{formatMs(log.latency)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">熔断器状态</h3>
          <div className="space-y-2">
            {cbMetrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded">
                <span className="text-[#CCD6F6] text-xs">{metric.name}</span>
                <span className={`text-xs font-medium ${stateColor(metric.state)}`}>{metric.state}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
