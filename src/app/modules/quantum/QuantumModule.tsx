import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const Cpu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const Activity = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Lock = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const Play = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" strokeWidth={2} /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Clock = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Server = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2" strokeWidth={2} /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" strokeWidth={2} /><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth={2} /><line x1="6" y1="18" x2="6.01" y2="18" strokeWidth={2} /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;

// Resource Monitoring
const ResourceModule = () => {
  const isMobile = useIsMobile();
  const { systemMetrics, navigateTo } = useGlobalData();
  const qubits = systemMetrics.quantumQubits;
  const fidelity = systemMetrics.quantumFidelity;
  const tasks = systemMetrics.quantumTasks;

  const handleCancelTask = (taskName: string, status: string) => {
    if (status === '已完成') {
      toast.info(`任务 "${taskName}" 已完成，无需操作`);
      return;
    }
    if (status === '运行中') {
      toast.warning(`正在中止任务: ${taskName}`, { description: '计算结果将被丢弃' });
      return;
    }
    toast.success(`已从队列移除: ${taskName}`);
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {[
          { label: '可用量子位', value: `${qubits} Qubits`, sub: 'IBM Eagle R3', color: 'text-[#38B2AC]' },
          { label: '门保真度', value: `${fidelity.toFixed(1)}%`, sub: '两比特门', color: 'text-[#4299E1]' },
          { label: '队列任务', value: `${tasks}`, sub: '等待执行', color: 'text-[#ECC94B]' },
          { label: '量子体积', value: '512', sub: 'QV Benchmark', color: 'text-white' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
            <p className="text-[10px] text-[#8892B0] mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">量子处理器状态</h3>
            <button
              onClick={() => toast.info('处理器状态已刷新', { description: `${qubits} Qubits 在线` })}
              className="text-[10px] text-[#4299E1] hover:underline"
            >
              刷新
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'QPU-Alpha (127 Qubits)', status: '在线', load: 68, temp: '15mK' },
              { name: 'QPU-Beta (72 Qubits)', status: '在线', load: 42, temp: '12mK' },
              { name: 'QPU-Gamma (27 Qubits)', status: '维护', load: 0, temp: '--' },
            ].map((qpu, i) => (
              <div key={i} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#4299E1]" />
                    <span className="text-[#CCD6F6] text-xs">{qpu.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${qpu.status === '在线' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#8892B0]/20 text-[#8892B0]'}`}>{qpu.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                      <span>负载</span><span>{qpu.load}%</span>
                    </div>
                    <div className="h-1.5 bg-[#071425] rounded overflow-hidden">
                      <div className={`h-full rounded transition-all duration-1000 ${qpu.load > 60 ? 'bg-[#ECC94B]' : 'bg-[#38B2AC]'}`} style={{ width: `${qpu.load}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8892B0]">温度: {qpu.temp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">任务队列</h3>
            <button
              onClick={() => {
                toast.info('新量子任务已提交', { description: '已加入队列，预计等待 5 分钟' });
              }}
              className="px-2 py-1 text-[10px] bg-[#38B2AC] text-white rounded hover:brightness-110"
            >
              + 提交任务
            </button>
          </div>
          <div className="space-y-2">
            {[
              { name: 'VaR蒙特卡洛模拟', status: '运行中', progress: 72, eta: '3m 12s' },
              { name: '组合优化 (QAOA)', status: '排队中', progress: 0, eta: '预计 8m' },
              { name: '随机数生成 (QRNG)', status: '排队中', progress: 0, eta: '预计 12m' },
              { name: '量子态层析', status: '已完成', progress: 100, eta: '-' },
              { name: '纠缠对分发', status: '已完成', progress: 100, eta: '-' },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-2 flex-1">
                  {task.status === '运行中' ? <Play className="w-3 h-3 text-[#38B2AC]" /> :
                   task.status === '已完成' ? <CheckCircle className="w-3 h-3 text-[#38B2AC]" /> :
                   <Clock className="w-3 h-3 text-[#8892B0]" />}
                  <span className="text-[#CCD6F6] text-xs">{task.name}</span>
                </div>
                {task.status === '运行中' && (
                  <div className="w-24 mx-2">
                    <div className="h-1 bg-[#071425] rounded overflow-hidden">
                      <div className="h-full bg-[#38B2AC] rounded animate-pulse" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-[#8892B0] shrink-0 mr-2">{task.eta}</span>
                {task.status !== '已完成' && (
                  <button
                    onClick={() => handleCancelTask(task.name, task.status)}
                    className="text-[10px] px-1.5 py-0.5 text-[#F56565] hover:bg-[#F56565]/10 rounded shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Algorithm Config
const AlgoModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();

  const handleConfigAlgo = (name: string, status: string) => {
    if (status === '实验') {
      toast.warning(`${name} 仍在实验阶段`, { description: '不建议用于生产策略' });
    } else {
      toast.info(`正在配置算法: ${name}`, { description: '打开参数调优面板' });
    }
  };

  const handleDeployAlgo = (name: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `正在部署 ${name} 至量子处理器...`,
        success: `${name} 部署成功，可在应用中心调用`,
        error: '部署失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        {[
          { name: 'QAOA', desc: '量子近似优化算法，适用于组合优化问题', type: '优化', layers: 'p=4', status: '可用' },
          { name: 'VQE', desc: '变分量子特征求解器，用于求解基态能量', type: '模拟', layers: 'ansatz=UCCSD', status: '可用' },
          { name: 'Grover', desc: '量子搜索算法，加速非结构化搜索', type: '搜索', layers: 'O(√N)', status: '可用' },
          { name: 'QSVM', desc: '量子支持向量机，加速分类任务', type: 'ML', layers: 'kernel=RBF', status: '可用' },
          { name: 'QNN', desc: '量子神经网络，混合量子经典训练', type: 'ML', layers: 'layers=6', status: '实验' },
          { name: 'QPE', desc: '量子相位估计，高精度数值计算', type: '计算', layers: 'n_qubits=10', status: '可用' },
        ].map((algo, i) => (
          <Card key={i} className="p-4 hover:border-[#38B2AC]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white text-sm">{algo.name}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded ${algo.status === '可用' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#ECC94B]/20 text-[#ECC94B]'}`}>{algo.status}</span>
            </div>
            <p className="text-[#8892B0] text-xs mb-3">{algo.desc}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">{algo.type}</span>
              <span className="text-[#8892B0] font-mono">{algo.layers}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleConfigAlgo(algo.name, algo.status)}
                className="flex-1 text-[10px] px-2 py-1.5 bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47]"
              >
                配置参数
              </button>
              <button
                onClick={() => handleDeployAlgo(algo.name)}
                className="flex-1 text-[10px] px-2 py-1.5 bg-[#38B2AC]/10 border border-[#38B2AC]/30 text-[#38B2AC] rounded hover:bg-[#38B2AC]/20"
              >
                部署
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Quantum Application
const AppModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();

  const appItems = [
    { name: '策略参数优化', desc: '使用QAOA在超大参数空间中全局寻优', icon: <Zap className="w-5 h-5 text-[#38B2AC]" />, speedup: '100x', lastRun: '2小时前', action: () => navigateTo('strategy', 'manage') },
    { name: 'VaR蒙特卡洛', desc: '量子加速蒙特卡洛模拟计算风险值', icon: <Activity className="w-5 h-5 text-[#4299E1]" />, speedup: '50x', lastRun: '30分钟前', action: () => navigateTo('risk', 'quantum_risk') },
    { name: '行情预测', desc: '量子机器学习模型预测价格走势', icon: <Activity className="w-5 h-5 text-[#ECC94B]" />, speedup: '20x', lastRun: '1小时前', action: () => navigateTo('market', 'insight') },
    { name: '模型训练加速', desc: '量子-经典混合训练深度学习模型', icon: <Cpu className="w-5 h-5 text-[#38B2AC]" />, speedup: '30x', lastRun: '4小时前', action: () => navigateTo('model', 'train') },
  ];

  const handleRunApp = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2500)),
      {
        loading: `正在启动量子应用: ${name}`,
        success: `${name} 已启动`,
        error: '启动失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {appItems.map((app, i) => (
          <Card key={i} className="p-4 hover:border-[#38B2AC]/30 transition-colors cursor-pointer" onClick={app.action}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#071425] rounded-lg flex items-center justify-center border border-[#233554]">{app.icon}</div>
              <div className="flex-1">
                <h4 className="text-white text-sm">{app.name}</h4>
                <p className="text-[10px] text-[#8892B0]">{app.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#38B2AC]">量子加速: {app.speedup}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8892B0]">上次: {app.lastRun}</span>
                <button
                  onClick={(e) => handleRunApp(app.name, e)}
                  className="px-2 py-0.5 bg-[#38B2AC] text-white rounded hover:brightness-110"
                >
                  运行
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Analysis
const AnalysisModule = () => {
  const isMobile = useIsMobile();

  const handleExportResult = (taskName: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1200)),
      {
        loading: `导出计算结果: ${taskName}...`,
        success: `${taskName} 结果已导出为 CSV`,
        error: '导出失败',
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">量子计算结果</h3>
          <button
            onClick={() => toast.success('所有结果已批量导出')}
            className="px-3 py-1.5 text-xs bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47] flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> 全部导出
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
              <tr>
                <th className="py-2 px-3 text-left">任务名称</th>
                <th className="py-2 px-3 text-left">算法</th>
                {!isMobile && <th className="py-2 px-3 text-right">量子位</th>}
                {!isMobile && <th className="py-2 px-3 text-right">经典耗时</th>}
                <th className="py-2 px-3 text-right">量子耗时</th>
                <th className="py-2 px-3 text-right">加速比</th>
                <th className="py-2 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'VaR计算 #128', algo: 'QAOA', qubits: 72, classical: '45min', quantum: '28s', speedup: '96x' },
                { name: '组合优化 #85', algo: 'VQE', qubits: 48, classical: '12min', quantum: '45s', speedup: '16x' },
                { name: '蒙特卡洛 #204', algo: 'Grover', qubits: 64, classical: '2h 15m', quantum: '2m 30s', speedup: '54x' },
                { name: '参数寻优 #67', algo: 'QAOA', qubits: 96, classical: '8h', quantum: '5m', speedup: '96x' },
              ].map((r, i) => (
                <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                  <td className="py-2 px-3 text-[#CCD6F6]">{r.name}</td>
                  <td className="py-2 px-3"><span className="px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded text-[10px]">{r.algo}</span></td>
                  {!isMobile && <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{r.qubits}</td>}
                  {!isMobile && <td className="py-2 px-3 text-right font-mono text-[#8892B0]">{r.classical}</td>}
                  <td className="py-2 px-3 text-right font-mono text-[#38B2AC]">{r.quantum}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#ECC94B]">{r.speedup}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleExportResult(r.name)}
                      className="text-[10px] px-2 py-0.5 text-[#4299E1] hover:bg-[#4299E1]/10 rounded"
                    >
                      导出
                    </button>
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

// Security
const SecurityModule = () => {
  const isMobile = useIsMobile();

  const [secItems, setSecItems] = useState([
    { name: '量子密钥分发 (QKD)', desc: 'BB84协议保护交易通信安全', icon: 'lock', status: '运行中', strength: '256-bit', enabled: true },
    { name: '数据加密 (PQC)', desc: '后量子密码学算法保护敏感数据', icon: 'lock2', status: '已启用', strength: 'Kyber-768', enabled: true },
    { name: '安全监控', desc: '实时监测量子通信信道安全状态', icon: 'activity', status: '正常', strength: 'QBER < 5%', enabled: true },
  ]);

  const handleToggleSecurity = (index: number) => {
    setSecItems(prev => prev.map((s, i) => {
      if (i !== index) return s;
      const newEnabled = !s.enabled;
      if (!newEnabled) {
        toast.warning(`已暂停: ${s.name}`, { description: '安全防护已降级，请尽快恢复' });
      } else {
        toast.success(`已恢复: ${s.name}`);
      }
      return { ...s, enabled: newEnabled, status: newEnabled ? (i === 0 ? '运行中' : i === 1 ? '已启用' : '正常') : '已暂停' };
    }));
  };

  const iconMap = {
    lock: <Lock className="w-5 h-5 text-[#38B2AC]" />,
    lock2: <Lock className="w-5 h-5 text-[#4299E1]" />,
    activity: <Activity className="w-5 h-5 text-[#ECC94B]" />,
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        {secItems.map((sec, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {iconMap[sec.icon as keyof typeof iconMap]}
              <h4 className="text-white text-sm">{sec.name}</h4>
            </div>
            <p className="text-[#8892B0] text-xs mb-3">{sec.desc}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className={sec.enabled ? 'text-[#38B2AC]' : 'text-[#F56565]'}>{sec.status}</span>
              <span className="text-[#8892B0] font-mono">{sec.strength}</span>
            </div>
            <button
              onClick={() => handleToggleSecurity(i)}
              className={`w-full mt-3 text-[10px] px-3 py-1.5 rounded transition-colors ${
                sec.enabled
                  ? 'bg-[#F56565]/10 border border-[#F56565]/30 text-[#F56565] hover:bg-[#F56565]/20'
                  : 'bg-[#38B2AC]/10 border border-[#38B2AC]/30 text-[#38B2AC] hover:bg-[#38B2AC]/20'
              }`}
            >
              {sec.enabled ? '暂停' : '恢复'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Workshop
const WorkshopModule = () => {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');

  const handleRunCircuit = useCallback(() => {
    if (running) return;
    setRunning(true);
    setOutput('');
    toast.info('量子电路提交到 QPU-Alpha...', { description: '3 量子位，GHZ 态制备' });

    setTimeout(() => {
      setOutput(
        `> 执行完成 (QPU-Alpha, 127 Qubits)\n` +
        `> Shots: 1024\n` +
        `> 结果分布:\n` +
        `  |000⟩: 512 (50.0%)\n` +
        `  |111⟩: 508 (49.6%)\n` +
        `  |其他⟩: 4 (0.4%)\n` +
        `> 保真度: 99.6% ✓\n` +
        `> 耗时: 1.23s`
      );
      setRunning(false);
      toast.success('量子电路执行完成', { description: 'GHZ 态保真度 99.6%' });
    }, 3000);
  }, [running]);

  return (
    <div className="space-y-6">
      <Card className="p-4 border-dashed border-[#38B2AC]/30">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-[#38B2AC]" />
          <div>
            <h3 className="text-white text-sm">量子实验工坊</h3>
            <p className="text-[10px] text-[#8892B0]">在沙盒环境中编写、调试和运行自定义量子电路</p>
          </div>
        </div>
        <div className="bg-[#071425] rounded p-4 border border-[#233554] font-mono text-xs text-[#CCD6F6]">
          <div className="text-[#8892B0]"># 创建量子电路</div>
          <div><span className="text-[#4299E1]">from</span> qiskit <span className="text-[#4299E1]">import</span> QuantumCircuit</div>
          <br/>
          <div className="text-[#8892B0]"># 初始化 3 量子位电路</div>
          <div>qc = QuantumCircuit(3, 3)</div>
          <div>qc.h(0)           <span className="text-[#8892B0]"># Hadamard 门</span></div>
          <div>qc.cx(0, 1)       <span className="text-[#8892B0]"># CNOT 门</span></div>
          <div>qc.cx(1, 2)       <span className="text-[#8892B0]"># CNOT 门</span></div>
          <div>qc.measure_all()  <span className="text-[#8892B0]"># 测量</span></div>
        </div>

        {output && (
          <div className="mt-3 bg-[#071425] rounded p-4 border border-[#38B2AC]/30 font-mono text-xs text-[#38B2AC] whitespace-pre-line">
            {output}
          </div>
        )}

        <div className="flex justify-end mt-3 gap-2">
          <button
            onClick={() => {
              setOutput('');
              toast.info('输出已清除');
            }}
            className="px-4 py-2 bg-[#112240] border border-[#233554] text-[#8892B0] text-xs rounded hover:bg-[#1A2B47]"
          >
            清除输出
          </button>
          <button
            onClick={handleRunCircuit}
            disabled={running}
            className="px-4 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${running ? 'animate-pulse' : ''}`} /> {running ? '执行中...' : '运行电路'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export const QuantumModule = ({ activeSub }: { activeSub: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'resource': return <ResourceModule />;
      case 'algo': return <AlgoModule />;
      case 'app': return <AppModule />;
      case 'analysis': return <AnalysisModule />;
      case 'security': return <SecurityModule />;
      case 'workshop': return <WorkshopModule />;
      default: return <ResourceModule />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};