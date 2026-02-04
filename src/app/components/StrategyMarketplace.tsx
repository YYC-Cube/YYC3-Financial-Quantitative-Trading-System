import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { 
  ShoppingBag, Upload, Star, Download, Tag, 
  Cpu, FileCode, Play, Users, Search 
} from '@/app/components/SafeIcons';
import { toast } from 'sonner';
import { motion } from '@/app/components/SafeMotion';
import { useHaptics } from '@/app/hooks/useHaptics';

interface Strategy {
  id: string;
  name: string;
  author: string;
  description: string;
  apy: string;
  rating: number;
  users: number;
  tags: string[];
  type: 'WASM' | 'JS' | 'PY';
  price: string;
}

const SAMPLE_STRATEGIES: Strategy[] = [
  {
    id: '1',
    name: 'Dilithium Arbitrage v3',
    author: 'QuantumFund',
    description: 'High-frequency statistical arbitrage protected by Dilithium signatures. Compiled to WASM for near-native performance.',
    apy: '+42.5%',
    rating: 4.8,
    users: 1240,
    tags: ['WASM', 'HFT', 'Arbitrage'],
    type: 'WASM',
    price: 'Free'
  },
  {
    id: '2',
    name: 'Grid Master Pro',
    author: 'DeFi_Wizard',
    description: 'Advanced grid trading bot with dynamic spacing based on volatility cones.',
    apy: '+18.2%',
    rating: 4.5,
    users: 850,
    tags: ['Grid', 'Neutral'],
    type: 'JS',
    price: '$10/mo'
  },
  {
    id: '3',
    name: 'Sentiment Alpha',
    author: 'AI_Research_Lab',
    description: 'Parses news sentiment using LLM and executes trend following trades.',
    apy: '+25.1%',
    rating: 4.2,
    users: 530,
    tags: ['AI', 'Trend'],
    type: 'PY',
    price: '$50/mo'
  }
];

export const StrategyMarketplace = () => {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_STRATEGIES'>('MARKET');
  const [search, setSearch] = useState('');
  const { triggerHaptic } = useHaptics();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.wasm')) {
        toast.error("无效的文件格式。请上传 .wasm 编译模块。");
        triggerHaptic('error');
        return;
      }
      triggerHaptic('success');
      toast.success(`策略模块 "${file.name}" 上传成功`, {
        description: "正在进行沙箱安全扫描与 Dilithium 验签...",
        icon: <Cpu className="w-4 h-4" />
      });
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <ShoppingBag className="w-6 h-6 text-[#38B2AC]" />
             策略市场 (Beta)
           </h2>
           <p className="text-[#8892B0] text-sm mt-1">发现、回测并部署由社区构建的高性能 WASM 交易策略</p>
        </div>
        <div className="flex bg-[#112240] p-1 rounded-lg border border-[#233554]">
           <button 
             onClick={() => { setActiveTab('MARKET'); triggerHaptic('selection'); }}
             className={`px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === 'MARKET' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-white'}`}
           >
             浏览市场
           </button>
           <button 
             onClick={() => { setActiveTab('MY_STRATEGIES'); triggerHaptic('selection'); }}
             className={`px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === 'MY_STRATEGIES' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-white'}`}
           >
             我的策略库
           </button>
        </div>
      </div>

      {activeTab === 'MARKET' ? (
        <div className="space-y-6">
           {/* Search & Filter */}
           <div className="flex gap-4">
              <div className="relative flex-1">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8892B0]" />
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="搜索策略、作者或标签..."
                   className="w-full bg-[#112240] border border-[#233554] rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#38B2AC] transition-colors placeholder-[#8892B0]/50"
                 />
              </div>
              <label className="cursor-pointer flex items-center gap-2 px-6 bg-[#38B2AC] hover:bg-[#319795] text-white font-bold rounded-lg transition-colors">
                 <Upload className="w-4 h-4" />
                 <span>上传 WASM 模块</span>
                 <input type="file" className="hidden" accept=".wasm" onChange={handleFileUpload} />
              </label>
           </div>

           {/* Featured Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_STRATEGIES.map((strategy) => (
                 <Card key={strategy.id} className="p-0 bg-[#112240] border-[#233554] overflow-hidden group hover:border-[#38B2AC] transition-all duration-300">
                    <div className="p-6">
                       <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${strategy.type === 'WASM' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#ECC94B]/20 text-[#ECC94B]'}`}>
                             {strategy.type === 'WASM' ? <Cpu className="w-6 h-6" /> : <FileCode className="w-6 h-6" />}
                          </div>
                          <div className="flex items-center gap-1 bg-[#0A192F] px-2 py-1 rounded text-xs font-bold text-[#8892B0]">
                             <Star className="w-3 h-3 text-[#ECC94B] fill-[#ECC94B]" /> {strategy.rating}
                          </div>
                       </div>
                       
                       <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#38B2AC] transition-colors">{strategy.name}</h3>
                       <p className="text-xs text-[#8892B0] mb-4">by {strategy.author}</p>
                       <p className="text-sm text-[#CCD6F6] mb-6 line-clamp-2 h-10">{strategy.description}</p>
                       
                       <div className="flex items-center gap-2 mb-6">
                          {strategy.tags.map(tag => (
                             <span key={tag} className="px-2 py-0.5 bg-[#233554] rounded text-[10px] text-[#8892B0] border border-[#233554]">
                                {tag}
                             </span>
                          ))}
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                             <p className="text-[10px] text-[#8892B0]">APY (30d)</p>
                             <p className="text-lg font-bold text-[#38B2AC] font-mono">{strategy.apy}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-[#8892B0]">Users</p>
                             <p className="text-lg font-bold text-white font-mono">{strategy.users}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 bg-[#0A192F] border-t border-[#233554] flex justify-between items-center">
                       <span className="text-white font-bold">{strategy.price}</span>
                       <button 
                         onClick={() => {
                            triggerHaptic('success');
                            toast.success(`已安装策略: ${strategy.name}`);
                         }}
                         className="flex items-center gap-2 px-4 py-2 bg-[#233554] hover:bg-[#38B2AC] text-white rounded text-xs font-bold transition-all"
                       >
                          <Download className="w-4 h-4" /> 安装
                       </button>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#233554] rounded-xl bg-[#112240]/50">
           <div className="w-16 h-16 rounded-full bg-[#233554] flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-[#8892B0]" />
           </div>
           <h3 className="text-white font-bold mb-2">暂无本地策略</h3>
           <p className="text-[#8892B0] text-sm mb-6">从市场下载或上传您自己的 WASM 模块</p>
           <label className="cursor-pointer px-6 py-2 bg-[#38B2AC] hover:bg-[#319795] text-white font-bold rounded transition-colors">
              上传 .wasm 文件
              <input type="file" className="hidden" accept=".wasm" onChange={handleFileUpload} />
           </label>
        </div>
      )}
    </div>
  );
};
