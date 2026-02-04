import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/app/components/ui/Card';
import { 
  MousePointer2, Move, Box, Database, Activity, 
  Zap, ShieldAlert, ArrowRight, Layers, Menu, X 
} from '@/app/components/SafeIcons';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { motion, AnimatePresence } from '@/app/components/SafeMotion';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Market Data Source (BTC/USDT)' },
    position: { x: 250, y: 5 },
    style: { background: '#112240', color: '#CCD6F6', border: '1px solid #38B2AC', borderRadius: '8px' },
  },
  {
    id: '2',
    data: { label: 'SMA Crossover Logic' },
    position: { x: 100, y: 150 },
    style: { background: '#112240', color: '#CCD6F6', border: '1px solid #ECC94B', borderRadius: '8px' },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Execute Buy Order' },
    position: { x: 250, y: 300 },
    style: { background: '#112240', color: '#CCD6F6', border: '1px solid #F56565', borderRadius: '8px' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#38B2AC' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#38B2AC' } },
];

const SIDEBAR_ITEMS = [
  { type: 'market', label: '行情数据', icon: Database, color: 'text-[#38B2AC]' },
  { type: 'logic', label: '逻辑节点', icon: Activity, color: 'text-[#ECC94B]' },
  { type: 'action', label: '交易执行', icon: Zap, color: 'text-[#F56565]' },
  { type: 'risk', label: '风险控制', icon: ShieldAlert, color: 'text-[#4299E1]' },
];

export const GraphicalEditor = () => {
  const isMobile = useIsMobile();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showLibrary, setShowLibrary] = useState(!isMobile);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#38B2AC' } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type: type === 'market' ? 'input' : type === 'action' ? 'output' : 'default',
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
        style: { 
            background: '#112240', 
            color: '#CCD6F6', 
            border: `1px solid ${type === 'market' ? '#38B2AC' : type === 'logic' ? '#ECC94B' : type === 'action' ? '#F56565' : '#4299E1'}`,
            borderRadius: '8px'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes]
  );

  // For mobile click-to-add
  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${nodes.length + 1}`,
      type: type === 'market' ? 'input' : type === 'action' ? 'output' : 'default',
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
      style: { 
          background: '#112240', 
          color: '#CCD6F6', 
          border: `1px solid ${type === 'market' ? '#38B2AC' : type === 'logic' ? '#ECC94B' : type === 'action' ? '#F56565' : '#4299E1'}`,
          borderRadius: '8px'
      },
    };
    setNodes((nds) => nds.concat(newNode));
    if (isMobile) setShowLibrary(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full border border-[#233554] rounded-lg overflow-hidden bg-[#0A192F] relative">
      {/* Component Library Toggle (Mobile Only) */}
      {isMobile && (
        <button 
          onClick={() => setShowLibrary(!showLibrary)}
          className="absolute top-4 left-4 z-10 p-2 bg-[#112240] border border-[#233554] rounded-lg shadow-lg"
        >
          {showLibrary ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5 text-[#38B2AC]" />}
        </button>
      )}

      {/* Sidebar Library */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div 
            initial={isMobile ? { x: -300 } : { width: 256 }}
            animate={isMobile ? { x: 0 } : { width: 256 }}
            exit={isMobile ? { x: -300 } : { width: 0 }}
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-20 w-64' : 'w-64'} 
              border-r border-[#233554] bg-[#112240] p-4 flex flex-col gap-4 shadow-2xl lg:shadow-none
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">组件库</h3>
              {isMobile && <button onClick={() => setShowLibrary(false)}><X className="w-4 h-4 text-[#8892B0]" /></button>}
            </div>
            
            <div className="space-y-3">
              {SIDEBAR_ITEMS.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-3 p-3 rounded bg-[#0A192F] border border-[#233554] cursor-grab hover:border-[#38B2AC] transition-all group active:scale-95"
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', item.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => isMobile && addNode(item.type)}
                  draggable={!isMobile}
                >
                  <div className={`p-2 rounded-lg bg-[#112240] group-hover:bg-[#38B2AC]/10 transition-colors`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#CCD6F6] font-medium">{item.label}</span>
                    <span className="text-[10px] text-[#8892B0]">
                      {isMobile ? '点击添加' : '拖拽添加'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-auto p-4 rounded bg-[#0A192F]/50 border border-[#233554] border-dashed">
               <p className="text-[10px] text-[#8892B0] text-center leading-relaxed">
                  {isMobile ? '移动端支持点击组件直接添加到画布中心。' : '将组件拖拽至右侧画布即可建立策略逻辑。'}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow Canvas */}
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            className="bg-[#0A192F]"
          >
            <Background color="#233554" variant={BackgroundVariant.Dots} />
            <Controls className="bg-[#112240] border-[#233554] text-white" />
            <MiniMap 
                nodeColor={(node) => {
                    switch (node.type) {
                        case 'input': return '#38B2AC';
                        case 'output': return '#F56565';
                        default: return '#ECC94B';
                    }
                }}
                maskColor="rgba(17, 34, 64, 0.8)"
                className="bg-[#0A192F] border border-[#233554] hidden sm:block" 
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};
