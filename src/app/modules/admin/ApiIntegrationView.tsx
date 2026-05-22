/**
 * @file src/app/modules/admin/ApiIntegrationView.tsx
 * @description API集成视图 - 后端连接测试、服务接口注册表、WebSocket状态监控
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getWebSocket, type WSStatus } from '@/app/api/client';
import { quickHealthCheck, runConnectionTests, yycApi, type ConnectionTestResult, type DeviceInfo, type HealthResponse } from '@/app/api/yyc-api';
import { Card } from '@/app/components/ui/card';

export const ApiIntegrationView = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [, setDevices] = useState<DeviceInfo[]>([]);
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [wsStatus, setWsStatus] = useState<WSStatus>(() => {
    if (typeof window === 'undefined') return 'disconnected';
    try {
      const ws = getWebSocket();
      return ws.status;
    } catch {
      return 'disconnected';
    }
  });
  const [wsMessages, setWsMessages] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const ws = getWebSocket();
      return ws.messageCount;
    } catch {
      return 0;
    }
  });
  const [lastTestTime, setLastTestTime] = useState<string>('');
  const [activeTab] = useState<'live' | 'services' | 'plan'>('live');

  useEffect(() => {
    quickHealthCheck().then(result => {
      if (result.online) {
        setHealthData({ status: 'ok', service: 'yyc3_aify', server: result.server, version: result.version, port: '', websocket: result.wsEnabled ? 'enabled' : 'disabled', email: 'admin@0379.email' });
      }
    });
    yycApi.devices.list().then(resp => {
      if (resp.data?.success) setDevices(resp.data.data);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const ws = getWebSocket();
    const unStatus = ws.onStatus(s => setWsStatus(s));
    const unMsg = ws.onMessage(() => setWsMessages(prev => prev + 1));
    return () => { unStatus(); unMsg(); };
  }, []);

  const handleRunTests = async () => {
    setIsTesting(true);
    toast.info('正在测试后端连通性...');
    try {
      const results = await runConnectionTests();
      setTestResults(results);
      setLastTestTime(new Date().toLocaleTimeString());
      const passed = results.filter(r => r.success).length;
      if (passed === results.length) {
        toast.success(`全部 ${passed} 个端点连通`);
      } else {
        toast.warning(`${passed}/${results.length} 个端点连通`);
      }
    } catch {
      toast.error('连接测试失败');
    }
    setIsTesting(false);
  };

  const handleConnectWS = () => {
    const ws = getWebSocket();
    if (ws.isConnected) {
      ws.disconnect();
      toast.info('WebSocket 已断开');
    } else {
      ws.connect();
      ws.subscribe('ai');
      ws.subscribe('device');
      toast.info('正在连接 WebSocket...');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">API 集成中心</h2>
        <div className="flex gap-2">
          <button onClick={handleConnectWS} className={`px-3 py-1.5 text-xs rounded ${wsStatus === 'connected' ? 'bg-[#F56565] text-white' : 'bg-[#38B2AC] text-white'}`}>
            {wsStatus === 'connected' ? '断开 WebSocket' : '连接 WebSocket'}
          </button>
          <button onClick={handleRunTests} disabled={isTesting} className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110 disabled:opacity-50">
            {isTesting ? '测试中...' : '运行连接测试'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">后端状态</div>
          <div className={`text-lg font-bold ${healthData?.status === 'ok' ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
            {healthData?.status === 'ok' ? '✅ 在线' : '❌ 离线'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">WebSocket</div>
          <div className={`text-lg font-bold ${wsStatus === 'connected' ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`}>
            {wsStatus === 'connected' ? `🟢 已连接 (${wsMessages})` : '⚪ 未连接'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">已测端点</div>
          <div className="text-lg font-bold text-white">{testResults.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">最后测试</div>
          <div className="text-sm text-[#CCD6F6]">{lastTestTime || '-'}</div>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'live' && (
        <Card className="p-4">
          <h3 className="text-white text-sm mb-4">连接测试结果</h3>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-[#8892B0] text-sm">点击&ldquo;运行连接测试&rdquo;开始检测</div>
          ) : (
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded ${r.success ? 'bg-[#065F46]/20' : 'bg-[#991B1B]/20'}`}>
                  <div className="flex items-center gap-3">
                    <span className={r.success ? 'text-[#38B2AC]' : 'text-[#F56565]'}>{r.success ? '✓' : '✗'}</span>
                    <div>
                      <div className="text-white text-xs font-medium">{r.name}</div>
                      <div className="text-[#8892B0] text-[10px]">{r.endpoint}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${r.success ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                      {r.latency != null ? `${r.latency.toFixed(0)}ms` : '超时'}
                    </div>
                    <div className="text-[10px] text-[#8892B0]">{r.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
