import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const Database = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const RefreshCw = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Server = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2" strokeWidth={2} /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" strokeWidth={2} /><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth={2} /><line x1="6" y1="18" x2="6.01" y2="18" strokeWidth={2} /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;
const Globe = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;

const DATA_SOURCES = [
  { name: 'Binance WebSocket', type: '交易所', status: '在线', records: '12.5M/日', latency: '< 50ms', uptime: '99.97%' },
  { name: 'CoinGecko API', type: '行情聚合', status: '在线', records: '2.1M/日', latency: '< 200ms', uptime: '99.85%' },
  { name: 'Bloomberg Terminal', type: '专业终端', status: '在线', records: '8.3M/日', latency: '< 100ms', uptime: '99.99%' },
  { name: 'Reddit/Twitter NLP', type: '情绪数据', status: '在线', records: '580K/日', latency: '< 1s', uptime: '98.5%' },
  { name: 'Chain Analytics', type: '链上数据', status: '维护', records: '3.2M/日', latency: '< 500ms', uptime: '97.8%' },
];

// Data Sources Management
const ManageModule = () => {
  const isMobile = useIsMobile();
  const [sources, setSources] = useState(DATA_SOURCES);

  const handleToggleSource = (name: string) => {
    setSources(prev => prev.map(s => {
      if (s.name !== name) return s;
      const newStatus = s.status === '在线' ? '已停止' : '在线';
      toast(newStatus === '在线' ? `数据源 ${name} 已恢复` : `数据源 ${name} 已停止`, {
        description: newStatus === '在线' ? '数据采集已恢复' : '停止采集，历史数据不受影响',
      });
      return { ...s, status: newStatus };
    }));
  };

  const handleTestConnection = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `正在测试连接: ${name}...`,
        success: `${name} 连接正常`,
        error: '连接测试失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {[
          { label: '活跃数据源', value: `${sources.filter(s => s.status === '在线').length}/${sources.length}`, color: 'text-[#38B2AC]' },
          { label: '日入库量', value: '26.7M', color: 'text-[#4299E1]' },
          { label: '数据总量', value: '2.8 TB', color: 'text-white' },
          { label: '平均延迟', value: '< 150ms', color: 'text-[#ECC94B]' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <h3 className="text-white text-sm">数据源列表</h3>
          <button
            onClick={() => toast.info('新数据源配置向导已打开', { description: '支持 REST API / WebSocket / FTP 等协议' })}
            className="px-3 py-1.5 text-xs bg-[#38B2AC] text-white rounded hover:brightness-110"
          >
            + 添加数据源
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
              <tr>
                <th className="py-2 px-3 text-left">数据源</th>
                {!isMobile && <th className="py-2 px-3 text-left">类型</th>}
                {!isMobile && <th className="py-2 px-3 text-right">日记录数</th>}
                {!isMobile && <th className="py-2 px-3 text-right">延迟</th>}
                <th className="py-2 px-3 text-right">可用率</th>
                <th className="py-2 px-3 text-left">状态</th>
                <th className="py-2 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((ds, i) => (
                <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                  <td className="py-2 px-3 text-white">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-[#4299E1] shrink-0" /> <span className="truncate">{ds.name}</span>
                    </div>
                  </td>
                  {!isMobile && <td className="py-2 px-3"><span className="px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded text-[10px]">{ds.type}</span></td>}
                  {!isMobile && <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{ds.records}</td>}
                  {!isMobile && <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{ds.latency}</td>}
                  <td className="py-2 px-3 text-right font-mono text-[#38B2AC]">{ds.uptime}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${ds.status === '在线' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : ds.status === '维护' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#8892B0]/20 text-[#8892B0]'}`}>{ds.status}</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleTestConnection(ds.name)}
                        className="text-[10px] px-1.5 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded"
                      >
                        测试
                      </button>
                      <button
                        onClick={() => handleToggleSource(ds.name)}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${ds.status === '在线' ? 'text-[#F56565] hover:bg-[#F56565]/10' : 'text-[#38B2AC] hover:bg-[#38B2AC]/10'}`}
                      >
                        {ds.status === '在线' ? '停止' : '启动'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Collection & Cleaning
const CollectionModule = () => {
  const isMobile = useIsMobile();

  const handlePauseTask = (name: string) => {
    toast.warning(`采集任务已暂停: ${name}`, { description: '暂停期间可能丢失实时数据' });
  };

  const handleRerunPipe = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `正在重新运行清洗管道: ${name}...`,
        success: `${name} 清洗完成`,
        error: '清洗管道执行失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">实时采集任务</h3>
          <div className="space-y-2">
            {[
              { name: 'BTC/USDT Tick数据', source: 'Binance', rate: '2,500/s', status: '运行' },
              { name: 'ETH/USDT 深度数据', source: 'Binance', rate: '1,800/s', status: '运行' },
              { name: '全市场K线同步', source: 'CoinGecko', rate: '500/s', status: '运行' },
              { name: '情绪指数采集', source: 'Twitter/Reddit', rate: '50/s', status: '运行' },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse" />
                  <span className="text-[#CCD6F6] text-xs">{task.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  {!isMobile && <span className="text-[#8892B0]">{task.source}</span>}
                  <span className="text-[#38B2AC] font-mono">{task.rate}</span>
                  <button
                    onClick={() => handlePauseTask(task.name)}
                    className="text-[#ECC94B] hover:bg-[#ECC94B]/10 px-1.5 py-0.5 rounded"
                  >
                    暂停
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">数据清洗管道</h3>
          <div className="space-y-2">
            {[
              { name: '去重过滤器', processed: '1.2M', filtered: '2,345', rate: '99.8%' },
              { name: '异常值检测', processed: '1.2M', filtered: '856', rate: '99.93%' },
              { name: '时间戳对齐', processed: '1.2M', filtered: '128', rate: '99.99%' },
              { name: '数据标准化', processed: '1.2M', filtered: '0', rate: '100%' },
            ].map((pipe, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[#38B2AC]" />
                  <span className="text-[#CCD6F6] text-xs">{pipe.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-[#8892B0]">过滤: {pipe.filtered}</span>
                  <span className="text-[#38B2AC] font-mono">{pipe.rate}</span>
                  <button
                    onClick={() => handleRerunPipe(pipe.name)}
                    className="text-[#4299E1] hover:bg-[#4299E1]/10 px-1.5 py-0.5 rounded"
                  >
                    重跑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Storage Management
const StorageModule = () => {
  const isMobile = useIsMobile();

  const handleMigrateData = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `正在迁移数据: ${name}...`,
        success: `${name} 迁移完成`,
        error: '迁移失败',
      }
    );
  };

  const handleCleanup = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2500)),
      {
        loading: '正在清理过期冷数据...',
        success: '冷数据清理完成，释放 120 GB',
        error: '清理失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {[
          { label: '总存储', value: '2.8 TB', sub: '已用 / 5 TB', color: 'text-[#4299E1]' },
          { label: '热数据', value: '450 GB', sub: 'SSD (最近7天)', color: 'text-[#38B2AC]' },
          { label: '温数据', value: '1.2 TB', sub: 'HDD (7-90天)', color: 'text-[#ECC94B]' },
          { label: '冷数据', value: '1.15 TB', sub: 'Archive (90天+)', color: 'text-[#8892B0]' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
            <p className="text-[10px] text-[#8892B0] mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-3`}>
          <h3 className="text-white text-sm">存储分布</h3>
          <button
            onClick={handleCleanup}
            className="px-3 py-1.5 text-xs bg-[#112240] border border-[#233554] text-[#ECC94B] rounded hover:bg-[#1A2B47]"
          >
            清理冷数据
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Tick交易数据', size: '1.2 TB', pct: 42.8, color: '#4299E1' },
            { name: 'K线历史数据', size: '680 GB', pct: 24.3, color: '#38B2AC' },
            { name: '订单簿快照', size: '420 GB', pct: 15.0, color: '#ECC94B' },
            { name: '链上数据', size: '280 GB', pct: 10.0, color: '#F56565' },
            { name: '情绪/新闻数据', size: '220 GB', pct: 7.9, color: '#8892B0' },
          ].map((d, i) => (
            <div key={i} className={`flex items-center gap-4 ${isMobile ? 'flex-wrap' : ''}`}>
              <span className={`${isMobile ? 'w-full' : 'w-32'} text-xs text-[#CCD6F6] shrink-0`}>{d.name}</span>
              <div className="flex-1 h-3 bg-[#071425] rounded overflow-hidden min-w-[80px]">
                <div className="h-full rounded transition-all" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
              </div>
              <span className="w-16 text-right text-xs font-mono text-[#CCD6F6]">{d.size}</span>
              <span className="w-12 text-right text-[10px] text-[#8892B0]">{d.pct}%</span>
              <button
                onClick={() => handleMigrateData(d.name)}
                className="text-[10px] px-1.5 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded shrink-0"
              >
                迁移
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Data Processing
const ProcessModule = () => {
  const isMobile = useIsMobile();

  const handleRestartStep = (step: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `正在重启流水线步骤: ${step}...`,
        success: `${step} 已重启`,
        error: '重启失败',
      }
    );
  };

  const handleRunTask = (name: string, status: string) => {
    if (status === '运行中') {
      toast.info(`${name} 正在持续运行中`);
      return;
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `手动触发: ${name}...`,
        success: `${name} 执行完成`,
        error: '执行失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-white text-sm mb-4">数据处理流水线</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['数据采集', '清洗过滤', '格式转换', '特征提取', '模型输入', '结果缓存'].map((step, i) => (
            <div key={i} className="contents">
              <div
                className="shrink-0 px-4 py-3 bg-[#0A192F] border border-[#233554] rounded text-center min-w-[100px] cursor-pointer hover:border-[#38B2AC]/50 transition-colors"
                onClick={() => handleRestartStep(step)}
              >
                <div className="text-xs text-[#CCD6F6]">{step}</div>
                <div className="text-[10px] text-[#38B2AC] mt-1">✓ 运行中</div>
              </div>
              {i < 5 && <div className="text-[#233554] shrink-0">→</div>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-white text-sm mb-3">调度任务</h3>
        <div className="space-y-2">
          {[
            { name: '日终数据聚合', schedule: '每日 00:00', last: '2026-02-15 00:00', next: '2026-02-16 00:00', status: '已完成' },
            { name: '周度报告生成', schedule: '每周日 06:00', last: '2026-02-09 06:00', next: '2026-02-16 06:00', status: '等待中' },
            { name: '实时特征计算', schedule: '持续运行', last: '-', next: '-', status: '运行中' },
            { name: '数据归档', schedule: '每月1号 02:00', last: '2026-02-01 02:00', next: '2026-03-01 02:00', status: '已完成' },
          ].map((task, i) => (
            <div key={i} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 bg-[#0A192F] rounded border border-[#233554]/50`}>
              <div>
                <span className="text-[#CCD6F6] text-xs">{task.name}</span>
                <span className="text-[10px] text-[#8892B0] block">{task.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  task.status === '运行中' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' :
                  task.status === '已完成' ? 'bg-[#4299E1]/20 text-[#4299E1]' :
                  'bg-[#8892B0]/20 text-[#8892B0]'
                }`}>{task.status}</span>
                <button
                  onClick={() => handleRunTask(task.name, task.status)}
                  className="text-[10px] px-2 py-0.5 bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47]"
                >
                  {task.status === '运行中' ? '查看' : '手动执行'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Quality
const QualityModule = () => {
  const isMobile = useIsMobile();

  const handleRecheck = (metric: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1800)),
      {
        loading: `正在重新检测: ${metric}...`,
        success: `${metric} 检测完成`,
        error: '检测失败',
      }
    );
  };

  const handleExportReport = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: '正在生成质量报告...',
        success: '数据质量报告已导出 (PDF)',
        error: '报告生成失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {[
          { label: '数据完整性', value: '99.97%', color: 'text-[#38B2AC]' },
          { label: '数据准确性', value: '99.85%', color: 'text-[#38B2AC]' },
          { label: '数据一致性', value: '99.92%', color: 'text-[#38B2AC]' },
          { label: '异常检测', value: '23 条', color: 'text-[#ECC94B]' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-3`}>
          <h3 className="text-white text-sm">质量检测结果</h3>
          <button
            onClick={handleExportReport}
            className="px-3 py-1.5 text-xs bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47] flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> 导出报告
          </button>
        </div>
        <div className="space-y-2">
          {[
            { metric: '时间戳连续性', result: 'PASS', details: '无间断', score: 100 },
            { metric: '价格合理性', result: 'PASS', details: '2个异常已过滤', score: 99.9 },
            { metric: '成交量一致性', result: 'WARN', details: '3个数据源差异 > 5%', score: 95.2 },
            { metric: '数据延迟', result: 'PASS', details: '平均 45ms', score: 99.5 },
            { metric: '缺失值检测', result: 'PASS', details: '补全率 99.99%', score: 99.99 },
          ].map((check, i) => (
            <div key={i} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 bg-[#0A192F] rounded border border-[#233554]/50`}>
              <div className="flex items-center gap-3">
                {check.result === 'PASS' ? <CheckCircle className="w-4 h-4 text-[#38B2AC]" /> : <AlertTriangle className="w-4 h-4 text-[#ECC94B]" />}
                <div>
                  <span className="text-[#CCD6F6] text-xs">{check.metric}</span>
                  <span className="text-[10px] text-[#8892B0] block">{check.details}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${check.score >= 99 ? 'text-[#38B2AC]' : 'text-[#ECC94B]'}`}>{check.score}%</span>
                <button
                  onClick={() => handleRecheck(check.metric)}
                  className="text-[10px] px-2 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded"
                >
                  重检
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Share
const ShareModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();

  const handleRequestAccess = (name: string, access: string) => {
    if (access === '全员') {
      toast.success(`已获取访问权限: ${name}`, { description: '数据集已添加到工作区' });
    } else {
      toast.info(`已提交访问申请: ${name}`, { description: `需要 ${access} 组长审批` });
    }
  };

  const handlePreviewData = (name: string) => {
    toast.info(`正在加载预览: ${name}`, { description: '显示最近 100 条数据样本' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <h3 className="text-white text-sm">数据资源目录</h3>
          <button
            onClick={() => navigateTo('bigdata', 'quality')}
            className="text-[10px] text-[#4299E1] hover:underline"
          >
            数据质量 &rarr;
          </button>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-3`}>
          {[
            { name: 'BTC全量Tick数据', period: '2020-至今', size: '480GB', access: '全员' },
            { name: 'ETH历史K线', period: '2018-至今', size: '120GB', access: '全员' },
            { name: '市场情绪指数', period: '2022-至今', size: '15GB', access: '策略组' },
            { name: '链上大额转账', period: '2023-至今', size: '85GB', access: '风控组' },
            { name: '宏观经济指标', period: '2010-至今', size: '5GB', access: '全员' },
            { name: '波动率曲面', period: '2024-至今', size: '32GB', access: '量化组' },
          ].map((res, i) => (
            <Card key={i} className="p-3 hover:border-[#38B2AC]/30 transition-colors">
              <h4 className="text-[#CCD6F6] text-xs mb-2">{res.name}</h4>
              <div className="space-y-1 text-[10px] text-[#8892B0]">
                <div className="flex justify-between"><span>时间范围</span><span className="text-[#CCD6F6]">{res.period}</span></div>
                <div className="flex justify-between"><span>数据量</span><span className="text-[#CCD6F6]">{res.size}</span></div>
                <div className="flex justify-between"><span>访问权限</span><span className="text-[#4299E1]">{res.access}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handlePreviewData(res.name)}
                  className="flex-1 text-[10px] px-2 py-1 bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47]"
                >
                  预览
                </button>
                <button
                  onClick={() => handleRequestAccess(res.name, res.access)}
                  className="flex-1 text-[10px] px-2 py-1 bg-[#38B2AC]/10 border border-[#38B2AC]/30 text-[#38B2AC] rounded hover:bg-[#38B2AC]/20"
                >
                  {res.access === '全员' ? '获取' : '申请'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const BigDataModule = ({ activeSub }: { activeSub: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'manage': return <ManageModule />;
      case 'collection': return <CollectionModule />;
      case 'storage': return <StorageModule />;
      case 'process': return <ProcessModule />;
      case 'quality': return <QualityModule />;
      case 'share': return <ShareModule />;
      default: return <ManageModule />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};