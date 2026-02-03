import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { Card } from '@/app/components/ui/Card';
import { Save, Play, Download, Upload, Copy, CheckCircle2 } from 'lucide-react';

const INITIAL_CODE = `# Quant Strategy Template - Python
import numpy as np
import pandas as pd

class MovingAverageStrategy(Strategy):
    def __init__(self, short_window=40, long_window=100):
        self.short_window = short_window
        self.long_window = long_window

    def on_data(self, data):
        """
        Called when new data arrives
        """
        # Calculate moving averages
        short_mavg = data['close'].rolling(window=self.short_window, min_periods=1).mean()
        long_mavg = data['close'].rolling(window=self.long_window, min_periods=1).mean()

        # Generate signals
        if short_mavg.iloc[-1] > long_mavg.iloc[-1]:
            return Order.BUY(100)
        elif short_mavg.iloc[-1] < long_mavg.iloc[-1]:
            return Order.SELL(100)
        
        return Order.HOLD

# Initialize and run
strategy = MovingAverageStrategy()
print("Strategy Initialized")
`;

export const CodeEditor = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#112240] rounded border border-[#233554]">
        <div className="flex items-center gap-4">
           <span className="text-sm font-bold text-[#CCD6F6]">Strategy.py</span>
           <div className="h-4 w-px bg-[#233554]" />
           <button className="flex items-center gap-2 text-xs text-[#8892B0] hover:text-white transition-colors">
             <Upload className="w-3 h-3" /> Import
           </button>
           <button className="flex items-center gap-2 text-xs text-[#8892B0] hover:text-white transition-colors">
             <Download className="w-3 h-3" /> Export
           </button>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:bg-[#233554]/80 transition-colors"
           >
             {saved ? <CheckCircle2 className="w-3 h-3 text-[#38B2AC]" /> : <Save className="w-3 h-3" />}
             {saved ? 'Saved' : 'Save'}
           </button>
           <button className="flex items-center gap-2 px-4 py-1.5 bg-[#38B2AC] text-white text-xs font-bold rounded hover:brightness-110 shadow-lg shadow-[#38B2AC]/20">
             <Play className="w-3 h-3" /> Run Backtest
           </button>
        </div>
      </div>

      {/* Editor Area */}
      <Card className="flex-1 overflow-hidden p-0 relative font-mono text-sm border border-[#233554] bg-[#0A192F]">
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
            padding={20}
            className="min-h-full"
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: '#0A192F',
              color: '#CCD6F6',
            }}
            textareaClassName="focus:outline-none"
          />
        </div>
      </Card>
      
      {/* Console/Output Panel (Collapsed by default logic can be added later) */}
      <div className="h-32 bg-[#112240] rounded border border-[#233554] p-2 overflow-hidden flex flex-col">
         <div className="text-xs font-bold text-[#8892B0] mb-2 uppercase tracking-wider">Console Output</div>
         <div className="flex-1 font-mono text-xs text-[#CCD6F6] overflow-auto">
            <span className="text-[#38B2AC]">{`>>>`}</span> Strategy initialized successfully.<br/>
            <span className="text-[#38B2AC]">{`>>>`}</span> Loaded 1000 candles for BTC/USDT.<br/>
            <span className="text-[#8892B0] opacity-50">Waiting for execution...</span>
         </div>
      </div>
    </div>
  );
};