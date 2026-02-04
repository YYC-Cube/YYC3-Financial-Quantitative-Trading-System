import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Settings, X, GripVertical, Save, Plus } from '@/app/components/SafeIcons';

// Mock Grid Layout to avoid import issues
const GridLayout = ({ children, className }: any) => (
  <div className={`grid grid-cols-2 gap-4 ${className}`}>
    {children}
  </div>
);

const Widget = ({ title, type, onRemove }: any) => (
  <Card className="h-full flex flex-col overflow-hidden bg-[#112240] border border-[#233554] shadow-lg group min-h-[200px]">
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
    <div className="flex-1 p-2 relative h-full flex items-center justify-center text-[#8892B0]">
      {type === 'chart' ? (
        <div className="text-center">
          <p>Chart Placeholder</p>
          <p className="text-xs opacity-50">Recharts temporarily disabled</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 h-full overflow-auto text-xs w-full">
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
  const [items, setItems] = React.useState([
    { id: 'a', title: 'BTC/USDT 15m', type: 'chart' },
    { id: 'b', title: 'ETH/USDT 15m', type: 'chart' },
    { id: 'c', title: '自选列表', type: 'list' },
    { id: 'd', title: '组合风险 (Delta)', type: 'chart' },
  ]);

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center px-4 py-2 bg-[#112240] rounded border border-[#233554]">
         <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs text-[#38B2AC] font-bold hover:brightness-110">
              <Plus className="w-4 h-4" /> 添加组件
            </button>
         </div>
         <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded font-bold hover:brightness-110">
            <Save className="w-3 h-3" /> 保存布局
         </button>
      </div>

      <div className="flex-1 bg-[#0A192F] border border-[#233554] rounded overflow-hidden relative p-4">
        <GridLayout className="layout">
          {items.map(item => (
            <div key={item.id} className="h-full">
              <Widget title={item.title} type={item.type} onRemove={() => removeItem(item.id)} />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};