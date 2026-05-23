/**
 * @file src/app/modules/admin/ScreenModule.tsx
 * @description 屏幕管理模块 - 多屏幕配置、布局管理、分辨率适配
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

import React, { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/app/components/ui/card';

type IconProps = React.SVGProps<SVGSVGElement>;
const Monitor = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2" strokeWidth={2} /><line x1="8" y1="21" x2="16" y2="21" strokeWidth={2} /><line x1="12" y1="17" x2="12" y2="21" strokeWidth={2} /></svg>;

export const ScreenModule = () => {
  const [screens] = useState([
    { id: 1, name: '主交易屏幕', resolution: '3840×2160', refreshRate: '144Hz', status: 'active' },
    { id: 2, name: '副监控屏', resolution: '2560×1440', refreshRate: '60Hz', status: 'active' },
    { id: 3, name: 'K线专用屏', resolution: '1920×1080', refreshRate: '60Hz', status: 'standby' },
  ]);

  const [layoutMode, setLayoutMode] = useState<'grid' | 'split' | 'fullscreen'>('grid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Monitor className="w-5 h-5" /> 屏幕管理中心
        </h2>
        <div className="flex gap-2">
          {(['grid', 'split', 'fullscreen'] as const).map(mode => (
            <button key={mode} onClick={() => { setLayoutMode(mode); toast.success(`切换至${mode === 'grid' ? '网格' : mode === 'split' ? '分屏' : '全屏'}模式`); }}
              className={`px-3 py-1.5 text-xs rounded ${layoutMode === mode ? 'bg-[#4299E1] text-white' : 'bg-[#233554] text-[#8892B0]'}`}>
              {mode === 'grid' ? '网格' : mode === 'split' ? '分屏' : '全屏'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {screens.map(screen => (
          <Card key={screen.id} className={`p-4 border-2 ${screen.status === 'active' ? 'border-[#38B2AC]' : 'border-[#233554]'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-medium">{screen.name}</span>
              <span className={`w-2 h-2 rounded-full ${screen.status === 'active' ? 'bg-[#38B2AC]' : 'bg-[#8892B0]'}`} />
            </div>
            <div className="space-y-1 text-xs text-[#8892B0]">
              <div>分辨率: {screen.resolution}</div>
              <div>刷新率: {screen.refreshRate}</div>
              <div>状态: {screen.status === 'active' ? '🟢 活跃' : '⏸ 待机'}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="text-white text-sm mb-3">布局预览</h3>
        <div className="bg-[#071425] rounded p-4 min-h-[200px] flex items-center justify-center border border-dashed border-[#233554]">
          <div className="text-center text-[#8892B0]">
            <Monitor className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{layoutMode === 'grid' ? '网格布局模式' : layoutMode === 'split' ? '分屏布局模式' : '全屏模式'}</p>
            <p className="text-xs mt-1">当前激活屏幕: {screens.filter(s => s.status === 'active').length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
