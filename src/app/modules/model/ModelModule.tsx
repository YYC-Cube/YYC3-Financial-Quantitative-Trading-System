import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const Cpu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Play = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" strokeWidth={2} /></svg>;
const Clock = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Star = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Upload = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" strokeWidth={2} /><line x1="12" y1="3" x2="12" y2="15" strokeWidth={2} /></svg>;
const Activity = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Search = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;

const MODELS = [
  { id: 1, name: 'LSTM价格预测', type: 'AI', category: '趋势预测', accuracy: '78.5%', sharpe: 1.62, status: '已部署', version: 'v3.1' },
  { id: 2, name: 'Transformer多因子', type: 'AI', category: '因子模型', accuracy: '82.3%', sharpe: 1.95, status: '已部署', version: 'v2.0' },
  { id: 3, name: 'XGBoost波动率', type: '经典ML', category: '波动率', accuracy: '75.8%', sharpe: 1.38, status: '训练中', version: 'v1.5' },
  { id: 4, name: '量子-经典混合模型', type: '量子', category: '组合优化', accuracy: '85.1%', sharpe: 2.12, status: '测试中', version: 'v1.0' },
  { id: 5, name: 'GRU情绪分析', type: 'AI', category: 'NLP', accuracy: '71.2%', sharpe: 1.15, status: '已部署', version: 'v2.3' },
  { id: 6, name: 'Black-Scholes扩展', type: '经典', category: '期权定价', accuracy: '92.1%', sharpe: 0, status: '已部署', version: 'v5.0' },
];

// Model Library
const LibraryModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();
  const [filter, setFilter] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const filtered = MODELS
    .filter(m => filter === '全部' || m.type === filter)
    .filter(m => !searchText || m.name.toLowerCase().includes(searchText.toLowerCase()) || m.category.includes(searchText));

  const handleModelClick = (model: typeof MODELS[0]) => {
    if (model.status === '已部署') {
      navigateTo('model', 'deploy');
    } else if (model.status === '训练中') {
      navigateTo('model', 'train');
    } else {
      navigateTo('model', 'eval');
    }
    toast.info(`查看模型: ${model.name} ${model.version}`, { description: `状态: ${model.status}` });
  };

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {['全部', 'AI', '经典ML', '量子', '经典'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded ${filter === f ? 'bg-[#38B2AC] text-white' : 'bg-[#112240] text-[#8892B0] hover:text-[#CCD6F6]'}`}>{f}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="bg-[#071425] border border-[#233554] rounded pl-9 pr-4 py-1.5 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-48"
            placeholder="搜索模型..."
          />
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-[#8892B0] text-xs text-center py-8">没有匹配的模型</p>
        )}
        {filtered.map(m => (
          <Card key={m.id} className="p-4 hover:border-[#38B2AC]/30 transition-colors cursor-pointer" onClick={() => handleModelClick(m)}>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-[#233554] shrink-0 ${
                  m.type === 'AI' ? 'bg-[#4299E1]/10' : m.type === '量子' ? 'bg-[#38B2AC]/10' : 'bg-[#ECC94B]/10'
                }`}>
                  {m.type === 'AI' ? <Cpu className="w-5 h-5 text-[#4299E1]" /> :
                   m.type === '量子' ? <Zap className="w-5 h-5 text-[#38B2AC]" /> :
                   <Activity className="w-5 h-5 text-[#ECC94B]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white text-sm">{m.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{m.version}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-[#8892B0] flex-wrap">
                    <span className="px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">{m.category}</span>
                    <span>准确率: <span className="text-[#CCD6F6]">{m.accuracy}</span></span>
                    {m.sharpe > 0 && <span>夏普: <span className="text-[#CCD6F6]">{m.sharpe}</span></span>}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${
                m.status === '已部署' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' :
                m.status === '训练中' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' :
                'bg-[#4299E1]/20 text-[#4299E1]'
              }`}>{m.status}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Training Module
const TrainModule = () => {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(68);
  const [isTraining, setIsTraining] = useState(true);

  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 0.5);
    }, 500);
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleNewTraining = () => {
    toast.info('新建训练任务', { description: '选择模型架构 → 配置超参数 → 选择数据集 → 开始训练' });
  };

  const handlePauseTraining = () => {
    setIsTraining(prev => {
      const next = !prev;
      toast(next ? '训练已恢复' : '训练已暂停', {
        description: next ? `当前 Epoch ${Math.round(progress)}/100` : '权重已保存为检查点',
      });
      return next;
    });
  };

  const handleViewCompleted = (name: string) => {
    toast.info(`加载训练详情: ${name}`, { description: '查看训练曲线、超参数和验证结果' });
  };

  const handleExportWeights = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `导出模型权重: ${name}...`,
        success: `${name} 权重已导出 (.pt)`,
        error: '导出失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <h3 className="text-white text-sm">训练任务</h3>
          <button
            onClick={handleNewTraining}
            className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-2"
          >
            <Play className="w-3 h-3" /> 新建训练
          </button>
        </div>

        {/* Active Training */}
        <div className="p-4 bg-[#0A192F] rounded border border-[#38B2AC]/30 mb-4">
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-3`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isTraining ? 'bg-[#38B2AC] animate-pulse' : 'bg-[#ECC94B]'}`} />
              <span className="text-white text-xs">Transformer多因子模型 v2.1 - {isTraining ? '训练中' : '已暂停'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8892B0]">Epoch {Math.round(progress)}/100</span>
              <button
                onClick={handlePauseTraining}
                className={`text-[10px] px-2 py-0.5 rounded ${isTraining ? 'text-[#ECC94B] hover:bg-[#ECC94B]/10' : 'text-[#38B2AC] hover:bg-[#38B2AC]/10'}`}
              >
                {isTraining ? '暂停' : '恢复'}
              </button>
            </div>
          </div>
          <div className="h-2 bg-[#071425] rounded overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-[#38B2AC] to-[#4299E1] rounded transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-[10px]`}>
            <div><span className="text-[#8892B0]">Loss:</span> <span className="text-[#CCD6F6] font-mono">0.0234</span></div>
            <div><span className="text-[#8892B0]">Val Loss:</span> <span className="text-[#CCD6F6] font-mono">0.0312</span></div>
            <div><span className="text-[#8892B0]">LR:</span> <span className="text-[#CCD6F6] font-mono">1e-4</span></div>
            <div><span className="text-[#8892B0]">ETA:</span> <span className="text-[#CCD6F6] font-mono">~12min</span></div>
          </div>
        </div>

        {/* Completed Training */}
        <div className="space-y-2">
          {[
            { name: 'LSTM价格预测 v3.1', time: '3小时前', epochs: '100/100', loss: '0.0189', val: '0.0245' },
            { name: 'GRU情绪分析 v2.3', time: '昨天', epochs: '80/80', loss: '0.0412', val: '0.0523' },
            { name: 'XGBoost波动率 v1.5', time: '2天前', epochs: '500 trees', loss: '0.0156', val: '0.0198' },
          ].map((t, i) => (
            <div key={i} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 bg-[#0A192F] rounded border border-[#233554]/50`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#38B2AC] shrink-0" />
                <div>
                  <span className="text-[#CCD6F6] text-xs">{t.name}</span>
                  <span className="text-[10px] text-[#8892B0] block">{t.time} | {t.epochs}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] text-[#8892B0]">
                  Loss: <span className="text-[#CCD6F6] font-mono">{t.loss}</span> | Val: <span className="text-[#CCD6F6] font-mono">{t.val}</span>
                </div>
                <button
                  onClick={() => handleViewCompleted(t.name)}
                  className="text-[10px] px-2 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded"
                >
                  详情
                </button>
                <button
                  onClick={() => handleExportWeights(t.name)}
                  className="text-[10px] px-2 py-0.5 text-[#38B2AC] hover:bg-[#38B2AC]/10 rounded"
                >
                  导出
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Evaluation Module
const EvalModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();

  const handleExportEval = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: '正在导出评估报告...',
        success: '模型评估报告已导出 (PDF)',
        error: '导出失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <h3 className="text-white text-sm">模型评估报告</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('strategy', 'backtest')}
              className="px-3 py-1.5 text-xs bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47]"
            >
              策略回测 &rarr;
            </button>
            <button
              onClick={handleExportEval}
              className="px-3 py-1.5 text-xs bg-[#112240] border border-[#233554] text-[#38B2AC] rounded hover:bg-[#1A2B47] flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> 导出
            </button>
          </div>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div>
            <h4 className="text-[#8892B0] text-xs uppercase mb-3">性能指标</h4>
            <div className="space-y-2">
              {[
                { metric: '方向准确率', value: '82.3%', benchmark: '50%', grade: 'A' },
                { metric: '夏普比率', value: '1.95', benchmark: '1.0', grade: 'A' },
                { metric: '最大回撤', value: '-6.8%', benchmark: '-15%', grade: 'A' },
                { metric: '信息比率', value: '1.42', benchmark: '0.5', grade: 'A' },
                { metric: 'Calmar比率', value: '2.87', benchmark: '1.0', grade: 'A+' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded">
                  <span className="text-[#CCD6F6] text-xs">{m.metric}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white">{m.value}</span>
                    {!isMobile && <span className="text-[10px] text-[#8892B0]">基准: {m.benchmark}</span>}
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#38B2AC]/20 text-[#38B2AC] rounded">{m.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#8892B0] text-xs uppercase mb-3">回测对比</h4>
            <div className="space-y-2">
              {[
                { period: '2025 Q1', model: '+8.2%', benchmark: '+3.1%', alpha: '+5.1%' },
                { period: '2025 Q2', model: '+12.5%', benchmark: '+5.8%', alpha: '+6.7%' },
                { period: '2025 Q3', model: '-2.1%', benchmark: '-5.2%', alpha: '+3.1%' },
                { period: '2025 Q4', model: '+15.8%', benchmark: '+8.4%', alpha: '+7.4%' },
                { period: '2026 Q1*', model: '+6.3%', benchmark: '+2.5%', alpha: '+3.8%' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-xs">
                  <span className="text-[#8892B0]">{p.period}</span>
                  <span className={`font-mono ${p.model.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{p.model}</span>
                  {!isMobile && <span className="font-mono text-[#8892B0]">{p.benchmark}</span>}
                  <span className="font-mono text-[#4299E1]">{p.alpha}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Deploy Module
const DeployModule = () => {
  const isMobile = useIsMobile();

  const handleRestartModel = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `正在重启模型服务: ${name}...`,
        success: `${name} 已重启`,
        error: '重启失败',
      }
    );
  };

  const handleScaleModel = (name: string) => {
    toast.info(`扩容请求已提交: ${name}`, { description: '预计 2 分钟完成实例扩容' });
  };

  const handleRollbackModel = (name: string) => {
    toast.warning(`确认回滚: ${name}`, { description: '将回退到上一个稳定版本' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <h3 className="text-white text-sm">已部署模型</h3>
          <button
            onClick={() => toast.info('模型部署向导已打开', { description: '选择模型 → 配置资源 → 选择环境 → 部署' })}
            className="px-3 py-1.5 text-xs bg-[#38B2AC] text-white rounded hover:brightness-110 flex items-center gap-1"
          >
            <Upload className="w-3 h-3" /> 部署新模型
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'LSTM价格预测 v3.1', env: '生产环境', requests: '12,500/min', latency: '8ms', cpu: '35%', memory: '2.1GB', uptime: '99.99%' },
            { name: 'Transformer多因子 v2.0', env: '生产环境', requests: '8,200/min', latency: '15ms', cpu: '48%', memory: '4.5GB', uptime: '99.97%' },
            { name: 'GRU情绪分析 v2.3', env: '生产环境', requests: '3,800/min', latency: '12ms', cpu: '22%', memory: '1.8GB', uptime: '99.95%' },
            { name: '量子-经典混合 v1.0', env: '预发布', requests: '500/min', latency: '120ms', cpu: '15%', memory: '3.2GB', uptime: '98.5%' },
          ].map((d, i) => (
            <div key={i} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-2`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${d.env === '生产环境' ? 'bg-[#38B2AC]' : 'bg-[#ECC94B]'}`} />
                  <span className="text-[#CCD6F6] text-xs">{d.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{d.env}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#38B2AC] text-[10px]">可用率 {d.uptime}</span>
                  <button
                    onClick={() => handleRestartModel(d.name)}
                    className="text-[10px] px-2 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded"
                  >
                    重启
                  </button>
                  <button
                    onClick={() => handleScaleModel(d.name)}
                    className="text-[10px] px-2 py-0.5 text-[#38B2AC] hover:bg-[#38B2AC]/10 rounded"
                  >
                    扩容
                  </button>
                  <button
                    onClick={() => handleRollbackModel(d.name)}
                    className="text-[10px] px-2 py-0.5 text-[#ECC94B] hover:bg-[#ECC94B]/10 rounded"
                  >
                    回滚
                  </button>
                </div>
              </div>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-[10px]`}>
                <div><span className="text-[#8892B0]">QPS:</span> <span className="text-[#CCD6F6] font-mono">{d.requests}</span></div>
                <div><span className="text-[#8892B0]">延迟:</span> <span className="text-[#CCD6F6] font-mono">{d.latency}</span></div>
                <div><span className="text-[#8892B0]">CPU:</span> <span className="text-[#CCD6F6] font-mono">{d.cpu}</span></div>
                <div><span className="text-[#8892B0]">内存:</span> <span className="text-[#CCD6F6] font-mono">{d.memory}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Dev Module
const DevModule = () => {
  const isMobile = useIsMobile();

  const handleOpenTool = (name: string) => {
    toast.info(`正在打开: ${name}`, { description: '开发环境加载中' });
  };

  const handleCreateFromTemplate = () => {
    toast.info('模型模板选择器已打开', { description: '12 个预置模型架构可供选择' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 border-dashed border-[#4299E1]/30">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-4`}>
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#4299E1]" />
            <div>
              <h3 className="text-white text-sm">模型开发框架</h3>
              <p className="text-[10px] text-[#8892B0]">基于PyTorch/TensorFlow的量化模型开发环境</p>
            </div>
          </div>
          <button
            onClick={handleCreateFromTemplate}
            className="px-3 py-1.5 text-xs bg-[#38B2AC] text-white rounded hover:brightness-110"
          >
            从模板创建
          </button>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
          {[
            { name: '模型模板', desc: '预置LSTM/Transformer/GRU等模型架构', count: '12个模板' },
            { name: '特征工程库', desc: '200+技术指标和因子计算组件', count: '215个组件' },
            { name: '可视化调试', desc: '训练过程可视化和模型结构展示', count: '实时监控' },
          ].map((tool, i) => (
            <div
              key={i}
              onClick={() => handleOpenTool(tool.name)}
              className="p-3 bg-[#0A192F] rounded border border-[#233554]/50 cursor-pointer hover:border-[#4299E1]/30 transition-colors"
            >
              <h4 className="text-[#CCD6F6] text-xs mb-1">{tool.name}</h4>
              <p className="text-[10px] text-[#8892B0] mb-2">{tool.desc}</p>
              <span className="text-[10px] text-[#38B2AC]">{tool.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Application Module
const AppModule = () => {
  const isMobile = useIsMobile();
  const { strategies, navigateTo } = useGlobalData();
  const linkedStrategies = strategies.filter(s => s.linkedModel);

  const handleAppClick = (link: (() => void) | null, name: string) => {
    if (link) {
      link();
    } else {
      toast.info(`${name} 效果追踪面板`, { description: '查看模型贡献度分析和日度汇总' });
    }
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {[
          { name: '策略信号生成', desc: '模型输出的买卖信号自动同步至策略引擎', active: 3, signals: '1,250/日', link: () => navigateTo('strategy', 'manage') },
          { name: '行情走势分析', desc: '实时预测价格趋势和关键支撑/阻力位', active: 2, signals: '24/7 运行', link: () => navigateTo('market', 'insight') },
          { name: '风控预测', desc: '预测组合风险指标和极端事件概率', active: 2, signals: '实时更新', link: () => navigateTo('risk', 'quantum_risk') },
          { name: '效果追踪', desc: '持续追踪模型预测效果和策略贡献', active: 5, signals: '日度汇总', link: null },
        ].map((app, i) => (
          <Card key={i} className="p-4 hover:border-[#38B2AC]/30 transition-colors cursor-pointer" onClick={() => handleAppClick(app.link, app.name)}>
            <h4 className="text-white text-sm mb-2">{app.name}</h4>
            <p className="text-[#8892B0] text-xs mb-3">{app.desc}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8892B0]">活跃模型: <span className="text-[#CCD6F6]">{app.active}</span></span>
              <span className="text-[#38B2AC]">{app.signals}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Model-Strategy Linkage from GlobalDataContext */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm">模型-策略对接状态</h3>
          <button onClick={() => navigateTo('strategy', 'manage')} className="text-[10px] text-[#4299E1] hover:underline">策略管理 &rarr;</button>
        </div>
        <div className="space-y-2">
          {linkedStrategies.map((strat) => (
            <div key={strat.id} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 bg-[#0A192F] rounded border border-[#233554]/50`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${strat.status === 'active' ? 'bg-[#38B2AC]' : 'bg-[#ECC94B]'}`} />
                <div>
                  <span className="text-[#CCD6F6] text-xs">{strat.name}</span>
                  <span className="text-[10px] text-[#8892B0] block">模型: {strat.linkedModel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${strat.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{strat.pnl}</span>
                <span className="text-[10px] text-[#8892B0]">夏普 {strat.sharpe}</span>
              </div>
            </div>
          ))}
          {linkedStrategies.length === 0 && (
            <p className="text-[#8892B0] text-xs text-center py-4">暂无已对接的策略</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export const ModelModule = ({ activeSub }: { activeSub: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'library': return <LibraryModule />;
      case 'train': return <TrainModule />;
      case 'eval': return <EvalModule />;
      case 'deploy': return <DeployModule />;
      case 'dev': return <DevModule />;
      case 'app': return <AppModule />;
      default: return <LibraryModule />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};