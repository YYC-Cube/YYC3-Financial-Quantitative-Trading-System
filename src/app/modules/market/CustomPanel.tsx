import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { GripVertical, Layers } from '@/app/components/SafeIcons';
import * as ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { KLineChart } from '@/app/components/KLineChart';

// Handle CJS/ESM interop for react-grid-layout
const RGL = ReactGridLayout as any;
const Responsive = RGL.Responsive || RGL.default?.Responsive;
const WidthProvider = RGL.WidthProvider || RGL.default?.WidthProvider;
const ResponsiveGridLayout = WidthProvider ? WidthProvider(Responsive) : Responsive;

const KLINE_DATA = Array.from({ length: 100 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (100 - i));
  const base = 100 + Math.random() * 50;
  return {
    time: date.toISOString().split('T')[0],
    open: base,
    high: base + Math.random() * 5,
    low: base - Math.random() * 5,
    close: base + (Math.random() - 0.5) * 5,
  };
});

export const CustomPanel = () => {
  const [layout, setLayout] = useState([
    { i: 'price', x: 0, y: 0, w: 4, h: 4 },
    { i: 'depth', x: 4, y: 0, w: 4, h: 4 },
    { i: 'risk', x: 8, y: 0, w: 4, h: 4 },
    { i: 'chart', x: 0, y: 4, w: 8, h: 8 },
    { i: 'orders', x: 8, y: 4, w: 4, h: 8 },
  ]);

  const widgets = {
    price: { title: '核心价格', content: '核心价格监控组件' },
    depth: { title: '盘口深度', content: 'L2 深度图表' },
    risk: { title: '风控状态', content: '实时风控仪表盘' },
    chart: { title: '行情主图', content: 'K线行情分析' },
    orders: { title: '当前委托', content: '实时订单列表' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#112240] p-4 rounded-lg border border-[#233554]">
        <div className="flex items-center gap-4">
          <p className="text-sm text-[#8892B0]">看板布局：<span className="text-[#38B2AC]">自定义拖拽模式</span></p>
          <div className="h-4 w-[1px] bg-[#233554]" />
          <button className="text-xs text-[#4299E1] hover:underline">+ 添加组件</button>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-[#071425] text-[10px] rounded border border-[#233554] text-[#CCD6F6]">保存当前布局</button>
          <button className="px-3 py-1 bg-[#4299E1] text-[10px] text-white rounded">重置</button>
        </div>
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={(currentLayout: any) => setLayout(currentLayout)}
        draggableHandle=".drag-handle"
      >
        {layout.map((item) => (
          <div key={item.i} className="relative">
            <Card className="h-full flex flex-col p-0 overflow-hidden shadow-lg bg-[#112240] border-[#233554]">
              <div className="drag-handle p-3 border-b border-[#233554] bg-[#0A192F] flex justify-between items-center cursor-move">
                <h4 className="text-xs font-bold text-[#FFFFFF] flex items-center gap-2">
                  <GripVertical className="w-3 h-3 text-[#8892B0]" />
                  {widgets[item.i as keyof typeof widgets].title}
                </h4>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#F56565] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-[#ECC94B] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-[#38B2AC] rounded-full" />
                </div>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center bg-[#112240] text-[#8892B0] text-sm relative">
                {item.i === 'chart' ? (
                  <div className="absolute inset-0 p-2">
                    <div className="w-full h-full border border-[#233554] rounded bg-[#071425]">
                      <KLineChart data={KLINE_DATA} colors={{ backgroundColor: '#071425' }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {widgets[item.i as keyof typeof widgets].content}
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};