import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Code, Terminal, Play, Save, Bug } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

const MOCK_CODE = `import numpy as np
import pandas as pd
from quant_engine import QuantumLayer

class HybridModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.classic_layer = nn.Linear(64, 32)
        self.quantum_layer = QuantumLayer(n_qubits=4)
        self.output = nn.Linear(4, 1)

    def forward(self, x):
        x = self.classic_layer(x)
        x = torch.relu(x)
        x = self.quantum_layer(x)
        return self.output(x)

# Initialize and train
model = HybridModel()
print("Model initialized with Quantum Layer")
`;

export const CustomDev = () => {
  const [code, setCode] = React.useState(MOCK_CODE);

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-8 flex flex-col gap-0 h-full">
        <div className="bg-[#112240] border-t border-x border-[#233554] p-2 flex items-center justify-between rounded-t-lg">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-[#0A192F] text-[#CCD6F6] text-xs rounded border-t-2 border-[#4299E1]">model_v1.py</span>
            <span className="px-3 py-1 text-[#8892B0] text-xs hover:bg-[#1A2B47] rounded cursor-pointer">utils.py</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 text-[#38B2AC] hover:bg-[#233554] rounded"><Play className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#CCD6F6] hover:bg-[#233554] rounded"><Save className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 bg-[#0A192F] border-x border-b border-[#233554] overflow-auto font-mono text-sm rounded-b-lg">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => highlight(code, languages.python, 'python')}
            padding={20}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: '#0A192F',
              minHeight: '100%',
              color: '#d4d4d4',
            }}
            className="min-h-full"
            textareaClassName="focus:outline-none"
          />
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="flex-1 bg-[#071425] border border-[#233554] flex flex-col font-mono text-xs">
           <div className="p-3 border-b border-[#233554] flex items-center gap-2 text-[#8892B0]">
             <Terminal className="w-4 h-4" /> 终端输出
           </div>
           <div className="p-4 flex-1 overflow-y-auto text-[#CCD6F6] space-y-2">
             <p><span className="text-[#38B2AC]">(base) user@quant-lab:~$</span> python train.py</p>
             <p>[INFO] Loading dataset...</p>
             <p>[INFO] Initializing Hybrid Quantum-Classical Model...</p>
             <p>[INFO] Connecting to QPU backend...</p>
             <p>Model initialized with Quantum Layer</p>
             <p>Epoch 1/10 - loss: 0.845 - acc: 0.52</p>
             <p>Epoch 2/10 - loss: 0.712 - acc: 0.64</p>
             <p className="animate-pulse">_</p>
           </div>
        </Card>
        
        <Card className="h-1/3 p-4">
           <h4 className="text-white font-bold mb-4 flex items-center gap-2">
             <Bug className="text-[#F56565] w-4 h-4" /> 调试变量
           </h4>
           <table className="w-full text-xs">
             <thead className="text-[#8892B0]">
               <tr>
                 <th className="text-left pb-2">Name</th>
                 <th className="text-left pb-2">Type</th>
                 <th className="text-right pb-2">Value</th>
               </tr>
             </thead>
             <tbody className="text-[#CCD6F6]">
               <tr>
                 <td className="py-1">lr</td>
                 <td className="py-1 text-[#4299E1]">float</td>
                 <td className="text-right py-1">0.001</td>
               </tr>
               <tr>
                 <td className="py-1">batch_size</td>
                 <td className="py-1 text-[#4299E1]">int</td>
                 <td className="text-right py-1">64</td>
               </tr>
               <tr>
                 <td className="py-1">device</td>
                 <td className="py-1 text-[#ECC94B]">str</td>
                 <td className="text-right py-1">'cuda:0'</td>
               </tr>
             </tbody>
           </table>
        </Card>
      </div>
    </div>
  );
};