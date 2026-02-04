import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Bot, Send, X, Mic, Terminal, Sparkles, BarChart2, AlertTriangle, ChevronRight, Minimize2, Maximize2 } from '@/app/components/SafeIcons';
import { motion, AnimatePresence } from '@/app/components/SafeMotion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'chart' | 'alert';
  timestamp: number;
}

interface AITraderAssistantProps {
  visible: boolean;
  onClose: () => void;
  contextData?: any; // Context from the trading system (prices, positions)
}

export const AITraderAssistant = ({ visible, onClose, contextData }: AITraderAssistantProps) => {
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: '交易员您好，我是您的 AI 协理。已接入实时行情与风控系统。您可以问我："分析 BTC 波动" 或 "生成 ETH 对冲建议"。',
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateResponse = async (query: string) => {
    setIsTyping(true);
    
    // Simulate LLM processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    let response: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      type: 'text'
    };

    if (query.includes('BTC') || query.includes('比特币')) {
      if (query.includes('波动') || query.includes('分析')) {
        response.content = '基于过去 1 小时的 Orderbook 热力图，BTC 在 $43,500 处存在巨额卖单墙（约 500 BTC）。买方力量略显疲软，Funding Rate 已转负。建议：短期看空，或在这个位置建立保护性看跌期权。';
        response.type = 'chart';
      } else {
        response.content = 'BTC 当前报价 $43,210。链上数据监测到 2 笔大额转账进入交易所，请注意潜在抛压。';
        response.type = 'alert';
      }
    } else if (query.includes('ETH') || query.includes('以太坊')) {
        response.content = 'ETH/BTC 汇率对正在测试 200 日均线支撑。DeFi 协议锁仓量（TVL）今日上涨 2.5%，基本面强劲。建议关注 $2,350 的突破情况。';
    } else if (query.includes('风险') || query.includes('Risk')) {
        response.content = '当前组合整体 Q-VaR (95%) 为 2.4%。由于 SOL 的波动率上升，使得整体风险敞口扩大。建议：减少 15% 的 SOL 多头头寸以维持 Delta Neutral。';
        response.type = 'alert';
    } else {
        response.content = '收到。正在调用 Quant-LLM-7B 模型分析该指令... (模拟：指令未匹配特定知识库，请尝试询问具体币种)';
    }

    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    generateResponse(userMsg.content);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed z-50 transition-all duration-300 ${minimized ? 'bottom-4 right-4 w-72 h-14' : 'bottom-4 right-4 w-96 h-[500px]'}`}
      >
        <Card className="w-full h-full flex flex-col bg-[#0A192F]/95 backdrop-blur border border-[#38B2AC]/30 shadow-2xl overflow-hidden relative">
           {/* Header */}
           <div 
             className="h-14 bg-[#112240] border-b border-[#233554] flex items-center justify-between px-4 cursor-pointer"
             onClick={() => setMinimized(!minimized)}
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38B2AC] to-[#4299E1] flex items-center justify-center shadow-[0_0_10px_rgba(56,178,172,0.5)]">
                    <Bot className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                       Alpha-GPT 
                       <span className="text-[10px] bg-[#38B2AC]/20 text-[#38B2AC] px-1.5 rounded">v2.1</span>
                    </h4>
                    {!minimized && <p className="text-[10px] text-[#8892B0] flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse"></span> 
                       Online | Latency: 45ms
                    </p>}
                 </div>
              </div>
              <div className="flex items-center gap-1 text-[#8892B0]">
                 <button onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }} className="p-1.5 hover:bg-[#233554] rounded">
                    {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 hover:bg-[#233554] rounded hover:text-white">
                    <X className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Body */}
           {!minimized && (
             <>
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0A192F] to-[#071425]" ref={scrollRef}>
                  {messages.map((msg) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                         msg.role === 'user' 
                           ? 'bg-[#38B2AC] text-white rounded-br-none shadow-lg' 
                           : 'bg-[#112240] text-[#CCD6F6] border border-[#233554] rounded-bl-none'
                       }`}>
                          {msg.role === 'assistant' && (
                             <div className="flex items-center gap-1.5 mb-2 text-[#38B2AC] font-bold text-xs opacity-80">
                                <Sparkles className="w-3 h-3" /> AI Assistant
                             </div>
                          )}
                          
                          {msg.content}
                          
                          {msg.type === 'chart' && (
                             <div className="mt-3 p-3 bg-[#0A192F] rounded border border-[#233554] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#38B2AC]/5" />
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#8892B0]">
                                   <BarChart2 className="w-4 h-4" /> 波动率锥分析
                                </div>
                                <div className="h-16 flex items-end gap-1">
                                   {[40, 65, 30, 80, 55, 90, 45, 60].map((h, i) => (
                                      <div key={i} className="flex-1 bg-[#38B2AC]" style={{ height: `${h}%`, opacity: 0.3 + (i/10) }} />
                                   ))}
                                </div>
                             </div>
                          )}

                          {msg.type === 'alert' && (
                             <div className="mt-2 flex items-center gap-2 text-[#F56565] text-xs font-bold bg-[#F56565]/10 p-2 rounded">
                                <AlertTriangle className="w-4 h-4" /> 风险预警
                             </div>
                          )}

                          <div className="text-[10px] opacity-40 mt-1 text-right">
                             {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                       </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-[#112240] rounded-2xl rounded-bl-none px-4 py-3 border border-[#233554] flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                       </div>
                    </div>
                  )}
               </div>

               {/* Input Area */}
               <div className="p-3 bg-[#112240] border-t border-[#233554]">
                  <div className="flex gap-2">
                     <button className="p-2 bg-[#233554] hover:bg-[#38B2AC] text-[#8892B0] hover:text-white rounded-lg transition-colors">
                        <Terminal className="w-5 h-5" />
                     </button>
                     <div className="flex-1 relative">
                        <input 
                           type="text" 
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                           placeholder="向 Alpha-GPT 提问..."
                           className="w-full bg-[#0A192F] border border-[#233554] rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-[#38B2AC] placeholder-[#8892B0]/50"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8892B0] hover:text-[#38B2AC]">
                           <Mic className="w-4 h-4" />
                        </button>
                     </div>
                     <button 
                       onClick={handleSend}
                       disabled={!input.trim() || isTyping}
                       className={`p-2 rounded-lg transition-all ${input.trim() ? 'bg-[#38B2AC] text-white' : 'bg-[#233554] text-[#8892B0]'}`}
                     >
                        <Send className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                     {['BTC 阻力位', '对冲策略', '大单监控', '市场情绪'].map((tag) => (
                        <button 
                           key={tag}
                           onClick={() => { setInput(tag); handleSend(); }}
                           className="whitespace-nowrap px-2 py-1 bg-[#233554]/50 hover:bg-[#233554] border border-[#233554] rounded text-[10px] text-[#8892B0] hover:text-[#38B2AC] transition-colors"
                        >
                           {tag}
                        </button>
                     ))}
                  </div>
               </div>
             </>
           )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
