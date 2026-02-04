import React, { useState } from 'react';
import { GraphicalEditor } from './GraphicalEditor';
import { CodeEditor } from './CodeEditor';
import { Card } from '@/app/components/ui/Card';
import { Layout, Code, PlayCircle, Settings2 } from '@/app/components/SafeIcons';

export const StrategyEditor = () => {
  const [mode, setMode] = useState<'graphical' | 'code'>('graphical');

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4">
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#112240] p-1 rounded-lg border border-[#233554]">
          <button
            onClick={() => setMode('graphical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'graphical'
                ? 'bg-[#38B2AC] text-white shadow-lg'
                : 'text-[#8892B0] hover:text-[#CCD6F6]'
            }`}
          >
            <Layout className="w-4 h-4" />
            Visual Flow
          </button>
          <button
            onClick={() => setMode('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'code'
                ? 'bg-[#38B2AC] text-white shadow-lg'
                : 'text-[#8892B0] hover:text-[#CCD6F6]'
            }`}
          >
            <Code className="w-4 h-4" />
            Python Code
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#8892B0]">
           <Settings2 className="w-4 h-4" />
           <span>Auto-sync enabled</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'graphical' ? <GraphicalEditor /> : <CodeEditor />}
      </div>
    </div>
  );
};