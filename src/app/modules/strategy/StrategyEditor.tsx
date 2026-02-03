import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { Play, Save, Download, Plus, Workflow, Code, Database, Zap } from 'lucide-react';

const MOCK_CODE = `import numpy as np
import pandas as pd

class MovingAverageCrossStrategy(Strategy):
    def init(self):
        # Initialize strategy parameters
        self.fast_window = 10
        self.slow_window = 30
        
    def next(self):
        # Calculate moving averages
        fast_ma = self.data.Close[-self.fast_window:].mean()
        slow_ma = self.data.Close[-self.slow_window:].mean()
        
        # Trading logic
        if fast_ma > slow_ma and not self.position:
            self.buy(size=1)
        elif fast_ma < slow_ma and self.position:
            self.sell(size=1)
`;

const VisualEditor = () => {
  return (
    <div className="flex h-full bg-[#071425]">
      {/* Component Library */}
      <div className="w-64 border-r border-[#233554] p-4 flex flex-col gap-4">
        <h4 className="text-xs text-[#8892B0] uppercase font-bold">组件库</h4>
        
        <div className="space-y-2">
          <div className="text-xs text-[#8892B0]">行情数据</div>
          <div className="bg-[#112240] p-3 rounded border border-[#233554] cursor-move hover:border-[#4299E1] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4299E1]" />
            <span className="text-sm text-[#CCD6F6]">K线数据源</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-[#8892B0]">逻辑运算</div>
          <div className="bg-[#112240] p-3 rounded border border-[#233554] cursor-move hover:border-[#4299E1] flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#ECC94B]" />
            <span className="text-sm text-[#CCD6F6]">均线交叉</span>
          </div>
          <div className="bg-[#112240] p-3 rounded border border-[#233554] cursor-move hover:border-[#4299E1] flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#ECC94B]" />
            <span className="text-sm text-[#CCD6F6]">RSI 超买超卖</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-[#8892B0]">交易执行</div>
          <div className="bg-[#112240] p-3 rounded border border-[#233554] cursor-move hover:border-[#4299E1] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#38B2AC]" />
            <span className="text-sm text-[#CCD6F6]">买入开仓</span>
          </div>
          <div className="bg-[#112240] p-3 rounded border border-[#233554] cursor-move hover:border-[#4299E1] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F56565]" />
            <span className="text-sm text-[#CCD6F6]">卖出平仓</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-[#0A192F] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))] opacity-10 pointer-events-none">
          {Array.from({ length: 1600 }).map((_, i) => (
            <div key={i} className="border border-[#CCD6F6]/20" />
          ))}
        </div>
        
        {/* Mock Flow Nodes */}
        <div className="absolute top-20 left-20 bg-[#112240] border-2 border-[#4299E1] p-4 rounded-lg w-48 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-[#4299E1]" />
            <span className="text-white font-bold text-sm">K线数据源</span>
          </div>
          <div className="text-xs text-[#8892B0]">Symbol: BTC/USDT</div>
          <div className="absolute right-[-8px] top-1/2 w-4 h-4 bg-[#4299E1] rounded-full border-2 border-[#0A192F]" />
        </div>

        <div className="absolute top-20 left-96 bg-[#112240] border border-[#233554] p-4 rounded-lg w-48 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="w-4 h-4 text-[#ECC94B]" />
            <span className="text-white font-bold text-sm">均线交叉</span>
          </div>
          <div className="text-xs text-[#8892B0]">Fast: 10, Slow: 30</div>
          <div className="absolute left-[-8px] top-1/2 w-4 h-4 bg-[#8892B0] rounded-full border-2 border-[#0A192F]" />
          <div className="absolute right-[-8px] top-1/2 w-4 h-4 bg-[#ECC94B] rounded-full border-2 border-[#0A192F]" />
        </div>

        <div className="absolute top-[-10px] left-[270px] w-64 h-40 pointer-events-none">
           <svg className="w-full h-full overflow-visible">
             <path d="M 0 50 C 60 50, 100 50, 130 50" stroke="#4299E1" strokeWidth="2" fill="none" />
           </svg>
        </div>
      </div>
    </div>
  );
};

export const StrategyEditor = ({ mode = 'code' }: { mode?: 'code' | 'visual' }) => {
  const [code, setCode] = useState(MOCK_CODE);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between bg-[#112240] border-b border-[#233554] px-4 py-2">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-bold text-sm">双均线策略 (MA_Cross_v1.py)</h3>
          <span className="text-xs text-[#8892B0]">上次保存: 10:23</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#38B2AC] text-white rounded hover:bg-[#319795]">
            <Play className="w-3.5 h-3.5" /> 运行回测
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#233554] text-[#CCD6F6] rounded hover:text-white">
            <Save className="w-3.5 h-3.5" /> 保存
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {mode === 'visual' ? (
          <VisualEditor />
        ) : (
          <div className="h-full bg-[#0A192F] overflow-auto font-mono text-sm">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => highlight(code, languages.python, 'python')}
              padding={20}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 14,
                backgroundColor: '#0A192F',
                minHeight: '100%',
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};