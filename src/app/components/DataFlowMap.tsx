import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';

// Inline icons
type IconProps = React.SVGProps<SVGSVGElement>;

const Maximize2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9" strokeWidth={2} /><polyline points="9 21 3 21 3 15" strokeWidth={2} /><line x1="21" y1="3" x2="14" y2="10" strokeWidth={2} /><line x1="3" y1="21" x2="10" y2="14" strokeWidth={2} /></svg>;

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  status: string;
  metric: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
  active: boolean;
}

export const DataFlowMap = ({ onNavigate }: { onNavigate?: (module: string, sub?: string) => void }) => {
  const { crossModuleSummary, systemMetrics, formatUSD } = useGlobalData();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const s = crossModuleSummary;

  // Define nodes in a circular layout
  const nodes: FlowNode[] = [
    { id: 'market', label: '市场数据', x: 300, y: 60, color: '#38B2AC', status: '在线', metric: `${s.market.assetCount}品种` },
    { id: 'bigdata', label: '数据管理', x: 520, y: 120, color: '#4299E1', status: `${s.bigdata.sources}源`, metric: `Q:${s.bigdata.quality.toFixed(0)}%` },
    { id: 'quantum', label: '量子计算', x: 560, y: 260, color: '#38B2AC', status: `${s.quantum.qubits}Qb`, metric: `${s.quantum.fidelity.toFixed(1)}%` },
    { id: 'model', label: '量化工坊', x: 460, y: 380, color: '#ECC94B', status: `${s.model.deployed}部署`, metric: `${s.model.bestAccuracy.toFixed(1)}%` },
    { id: 'strategy', label: '智能策略', x: 140, y: 380, color: '#4299E1', status: `${s.strategy.activeCount}活跃`, metric: `胜率${s.strategy.avgWinRate}%` },
    { id: 'risk', label: '风险管控', x: 40, y: 260, color: s.risk.riskLevel === 'high' ? '#F56565' : s.risk.riskLevel === 'medium' ? '#ECC94B' : '#38B2AC', status: s.risk.riskLevel === 'high' ? '高危' : s.risk.riskLevel === 'medium' ? '中风险' : '低风险', metric: `VaR$${Math.abs(s.risk.var95).toLocaleString()}` },
    { id: 'trade', label: '交易中心', x: 80, y: 120, color: '#38B2AC', status: `${s.trade.openPositions}持仓`, metric: formatUSD(s.trade.todayPnl) },
    { id: 'admin', label: '管理后台', x: 300, y: 220, color: '#8892B0', status: 'UP', metric: `CPU${Math.round(s.admin.cpuUsage)}%` },
  ];

  // Define edges (data flow connections)
  const edges: FlowEdge[] = [
    { from: 'market', to: 'bigdata', label: '行情采集', active: true },
    { from: 'bigdata', to: 'model', label: '训练数据', active: true },
    { from: 'bigdata', to: 'quantum', label: '计算数据', active: true },
    { from: 'quantum', to: 'model', label: '量子加速', active: true },
    { from: 'quantum', to: 'risk', label: 'VaR计算', active: true },
    { from: 'model', to: 'strategy', label: '模型信号', active: true },
    { from: 'strategy', to: 'trade', label: '交易信号', active: true },
    { from: 'strategy', to: 'risk', label: '风控检查', active: true },
    { from: 'trade', to: 'risk', label: '持仓数据', active: true },
    { from: 'market', to: 'trade', label: '实时价格', active: true },
    { from: 'market', to: 'strategy', label: '行情驱动', active: true },
    { from: 'risk', to: 'trade', label: '风控指令', active: true },
    { from: 'admin', to: 'market', label: '系统配置', active: false },
    { from: 'admin', to: 'bigdata', label: '数据配置', active: false },
  ];

  // Animate data flow pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 440 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, 600, 440);

    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const fx = fromNode.x + 30;
      const fy = fromNode.y + 15;
      const tx = toNode.x + 30;
      const ty = toNode.y + 15;

      // Line
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = edge.active ? 'rgba(56, 178, 172, 0.2)' : 'rgba(35, 53, 84, 0.3)';
      ctx.lineWidth = edge.active ? 1.5 : 0.8;
      ctx.stroke();

      // Animated dot on active edges
      if (edge.active) {
        const t = ((pulsePhase + edges.indexOf(edge) * 15) % 100) / 100;
        const dotX = fx + (tx - fx) * t;
        const dotY = fy + (ty - fy) * t;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38B2AC';
        ctx.fill();
      }

      // Edge label at midpoint
      if (activeNode === edge.from || activeNode === edge.to) {
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2;
        ctx.fillStyle = '#8892B0';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, mx, my - 4);
      }
    });
  }, [pulsePhase, activeNode, nodes, edges]);

  const getHighlightedEdges = (nodeId: string) => {
    return edges.filter(e => e.from === nodeId || e.to === nodeId);
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm">模块间数据流图</h3>
          <span className="text-[10px] px-2 py-0.5 bg-[#38B2AC]/10 text-[#38B2AC] rounded">实时</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#8892B0]">
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#38B2AC]/40 inline-block" /> 活跃数据流</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#233554]/60 inline-block" /> 配置连接</span>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', maxWidth: 600, height: 440, margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          style={{ width: 600, height: 440, position: 'absolute', top: 0, left: 0 }}
        />
        {/* Overlay node chips */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              activeNode === node.id ? 'z-20 scale-110' : activeNode ? 'opacity-60 z-10' : 'z-10'
            }`}
            style={{ left: node.x, top: node.y }}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            onClick={() => onNavigate && onNavigate(node.id)}
          >
            <div className={`px-3 py-2 rounded-lg border transition-colors ${
              activeNode === node.id
                ? 'bg-[#112240] border-[#38B2AC]/60 shadow-lg shadow-[#38B2AC]/10'
                : 'bg-[#112240]/90 border-[#233554]/80 hover:border-[#38B2AC]/30'
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.color }} />
                <span className="text-white text-[11px] font-medium">{node.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <span style={{ color: node.color }}>{node.status}</span>
                <span className="text-[#8892B0] font-mono">{node.metric}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Hover tooltip with connections */}
        {activeNode && (
          <div className="absolute bottom-2 left-2 right-2 px-3 py-2 bg-[#071425]/90 border border-[#233554] rounded-lg z-30">
            <div className="flex items-center gap-4 text-[10px] overflow-x-auto no-scrollbar">
              <span className="text-[#8892B0] shrink-0">数据流:</span>
              {getHighlightedEdges(activeNode).map((e, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  <span className="text-[#CCD6F6]">{e.from === activeNode ? nodes.find(n => n.id === e.to)?.label : nodes.find(n => n.id === e.from)?.label}</span>
                  <span className="text-[#38B2AC]">({e.label})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};