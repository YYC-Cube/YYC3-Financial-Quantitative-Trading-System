import React, { useState, useRef, useEffect } from 'react';
import RGL from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '@/app/components/ui/Card';
import { Settings, X, GripVertical, Save, Plus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// Fix for RGL import in Vite: Handle both default and named export scenarios
const GridLayout = (RGL as any).default || RGL;

const MOCK_CHART_DATA = Array.from({ length: 20 }, (_, i) => ({
  value: Math.random() * 100
}));

const Widget = ({ title, type, onRemove }: any) => (
  <Card className="h-full flex flex-col overflow-hidden bg-[#112240] border border-[#233554] shadow-lg group">
    <div className="flex items-center justify-between p-2 bg-[#0A192F] border-b border-[#233554] cursor-move draggable-handle">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-[#8892B0]" />
        <span className="text-xs font-bold text-white">{title}</span>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings className="w-3 h-3 text-[#8892B0] cursor-pointer hover:text-white" />
        <X className="w-3 h-3 text-[#F56565] cursor-pointer hover:text-white" onClick={onRemove} />
      </div>
    </div>
    <div className="flex-1 p-2 relative">
      {type === 'chart' ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_CHART_DATA}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area type="monotone" dataKey="value" stroke="#38B2AC" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col gap-2 h-full overflow-auto text-xs">
          {[1,2,3,4,5].map(i => (
             <div key={i} className="flex justify-between items-center p-1 border-b border-[#233554]/30">
                <span className="text-[#CCD6F6]">BTC/USDT</span>
                <span className="text-[#38B2AC]">+2.4%</span>
             </div>
          ))}
        </div>
      )}
    </div>
  </Card>
);

export const CustomPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  const [layout, setLayout] = useState<Layout[]>([
    { i: 'a', x: 0, y: 0, w: 4, h: 4 },
    { i: 'b', x: 4, y: 0, w: 4, h: 4 },
    { i: 'c', x: 8, y: 0, w: 4, h: 4 },
    { i: 'd', x: 0, y: 4, w: 8, h: 4 },
  ]);

  const [items, setItems] = useState([
    { id: 'a', title: 'BTC/USDT 15m', type: 'chart' },
    { id: 'b', title: 'ETH/USDT 15m', type: 'chart' },
    { id: 'c', title: 'Watchlist', type: 'list' },
    { id: 'd', title: 'Portfolio Delta', type: 'chart' },
  ]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Use ResizeObserver to automatically adjust width
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use contentRect.width for precise content width
        if (entry.contentRect.width > 0) {
            setWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    setLayout(layout.filter(l => l.i !== id));
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center px-4 py-2 bg-[#112240] rounded border border-[#233554]">
         <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs text-[#38B2AC] font-bold hover:brightness-110">
              <Plus className="w-4 h-4" /> Add Widget
            </button>
         </div>
         <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded font-bold hover:brightness-110">
            <Save className="w-3 h-3" /> Save Layout
         </button>
      </div>

      <div className="flex-1 bg-[#0A192F] border border-[#233554] rounded overflow-hidden relative" ref={containerRef}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={width}
          draggableHandle=".draggable-handle"
          onLayoutChange={onLayoutChange}
        >
          {items.map(item => (
            <div key={item.id}>
              <Widget title={item.title} type={item.type} onRemove={() => removeItem(item.id)} />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};