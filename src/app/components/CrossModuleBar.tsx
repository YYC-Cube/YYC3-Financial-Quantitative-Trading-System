import React from 'react';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';

// Inline icons for module-connection display
type IconProps = React.SVGProps<SVGSVGElement>;

const ArrowRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const Link2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;

interface ModuleDataLink {
  module: string;
  sub?: string;
  tertiary?: string;
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}

// Define data flow dependencies for each module
const MODULE_DATA_FLOWS: Record<string, string[]> = {
  market: ['strategy', 'risk', 'trade', 'bigdata'],
  strategy: ['market', 'model', 'quantum', 'trade'],
  risk: ['market', 'strategy', 'trade', 'quantum'],
  quantum: ['strategy', 'risk', 'model', 'bigdata'],
  bigdata: ['market', 'model', 'quantum', 'admin'],
  model: ['strategy', 'quantum', 'bigdata', 'risk'],
  trade: ['market', 'strategy', 'risk', 'model'],
  admin: ['market', 'strategy', 'risk', 'quantum', 'bigdata', 'model', 'trade'],
};

export const CrossModuleBar = ({ currentModule }: { currentModule: string }) => {
  const { crossModuleSummary, navigateTo, formatUSD } = useGlobalData();
  const isMobile = useIsMobile();

  const connectedModules = MODULE_DATA_FLOWS[currentModule] || [];

  const getModuleChip = (moduleId: string): ModuleDataLink | null => {
    const s = crossModuleSummary;
    switch (moduleId) {
      case 'market':
        return { module: 'market', sub: 'live', label: '行情', value: `${s.market.topMover} ${s.market.topMoveChange >= 0 ? '+' : ''}${s.market.topMoveChange.toFixed(1)}%`, color: s.market.topMoveChange >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' };
      case 'strategy':
        return { module: 'strategy', sub: 'manage', label: '策略', value: `${s.strategy.activeCount}活跃 | 胜率${s.strategy.avgWinRate}%`, color: 'text-[#4299E1]' };
      case 'risk':
        return { module: 'risk', sub: 'live_risk', label: '风控', value: s.risk.riskLevel === 'high' ? '高风险' : s.risk.riskLevel === 'medium' ? '中风险' : '低风险', color: s.risk.riskLevel === 'high' ? 'text-[#F56565]' : s.risk.riskLevel === 'medium' ? 'text-[#ECC94B]' : 'text-[#38B2AC]', pulse: s.risk.riskLevel === 'high' };
      case 'quantum':
        return { module: 'quantum', sub: 'resource', label: '量子', value: `${s.quantum.qubits}Qb ${s.quantum.fidelity.toFixed(1)}%`, color: 'text-[#38B2AC]' };
      case 'bigdata':
        return { module: 'bigdata', sub: 'manage', label: '数据', value: `${s.bigdata.sources}源 Q:${s.bigdata.quality.toFixed(0)}%`, color: 'text-[#4299E1]' };
      case 'model':
        return { module: 'model', sub: 'library', label: '模型', value: `${s.model.deployed}部署 ${s.model.training}训练`, color: 'text-[#ECC94B]' };
      case 'trade':
        return { module: 'trade', sub: 'real', label: '交易', value: `${s.trade.openPositions}持仓 ${formatUSD(s.trade.todayPnl)}`, color: s.trade.todayPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' };
      case 'admin':
        return { module: 'admin', sub: 'screen', label: '系统', value: `CPU${Math.round(s.admin.cpuUsage)}% UP${s.admin.uptime}`, color: 'text-[#38B2AC]' };
      default:
        return null;
    }
  };

  const chips = connectedModules.map(getModuleChip).filter(Boolean) as ModuleDataLink[];

  // On mobile: compact two-row wrapped layout with smaller chips
  if (isMobile) {
    return (
      <div className="mb-3 p-2 bg-[#0A192F]/60 rounded-lg border border-[#233554]/50 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Link2 className="w-3 h-3 text-[#38B2AC]" />
          <span className="text-[9px] text-[#8892B0] uppercase tracking-wider">数据联动</span>
          <span className="text-[9px] text-[#233554] ml-auto">{chips.length}模块</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.module}
              onClick={() => navigateTo(chip.module, chip.sub, chip.tertiary)}
              className="flex items-center gap-1 px-2 py-1 bg-[#112240]/80 rounded border border-[#233554]/60 active:scale-[0.97] transition-all shrink-0"
            >
              {chip.pulse && <span className="w-1 h-1 rounded-full bg-[#F56565] animate-pulse" />}
              <span className="text-[9px] text-[#8892B0]">{chip.label}</span>
              <span className={`text-[9px] font-mono ${chip.color}`}>{chip.value}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-2.5 bg-[#0A192F]/60 rounded-lg border border-[#233554]/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#233554]">
          <Link2 className="w-3.5 h-3.5 text-[#38B2AC]" />
          <span className="text-[10px] text-[#8892B0] uppercase tracking-wider">数据联动</span>
        </div>
        {chips.map((chip, i) => (
          <button
            key={chip.module}
            onClick={() => navigateTo(chip.module, chip.sub, chip.tertiary)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#112240]/80 rounded border border-[#233554]/60 hover:border-[#38B2AC]/40 transition-all shrink-0 group"
          >
            {chip.pulse && <span className="w-1.5 h-1.5 rounded-full bg-[#F56565] animate-pulse" />}
            <span className="text-[10px] text-[#8892B0] group-hover:text-[#CCD6F6]">{chip.label}</span>
            <span className={`text-[10px] font-mono ${chip.color}`}>{chip.value}</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#233554] group-hover:text-[#38B2AC] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};