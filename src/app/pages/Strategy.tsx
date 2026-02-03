import React from 'react';
import { Card, CardHeader } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Play, Pause, Edit, Trash2, Copy, BarChart } from 'lucide-react';

const strategies = [
  { id: 1, name: 'Dual Momentum Alpha', type: 'Trend Following', status: 'Running', return: '+45.2%', risk: 'Medium', version: 'v2.1' },
  { id: 2, name: 'Mean Reversion HFT', type: 'Arbitrage', status: 'Paused', return: '+12.5%', risk: 'Low', version: 'v1.4' },
  { id: 3, name: 'Quantum Sentiment', type: 'AI/ML', status: 'Backtesting', return: 'N/A', risk: 'High', version: 'v0.9' },
  { id: 4, name: 'Grid Trading ETH', type: 'Market Making', status: 'Running', return: '+8.4%', risk: 'Low', version: 'v3.0' },
];

export default function Strategy() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-main">智能策略引擎</h1>
        <button className="bg-accent-blue text-white px-4 py-2 rounded-md hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20">
          + 新建策略
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-bg-card to-primary-light border-accent-blue/30">
          <div className="text-text-muted mb-2">运行中策略</div>
          <div className="text-3xl font-bold text-white">12</div>
          <div className="text-sm text-accent-green mt-2">Total AUM: $2.4M</div>
        </Card>
        <Card>
          <div className="text-text-muted mb-2">今日收益</div>
          <div className="text-3xl font-bold text-accent-green">+$4,231.50</div>
          <div className="text-sm text-text-muted mt-2">Daily ROI: +1.2%</div>
        </Card>
        <Card>
          <div className="text-text-muted mb-2">活跃信号</div>
          <div className="text-3xl font-bold text-accent-yellow">145</div>
          <div className="text-sm text-text-muted mt-2">Latency: 24ms</div>
        </Card>
      </div>

      <Card noPadding>
        <CardHeader title="My Strategies" className="p-6 border-b border-border" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-6 py-4 font-medium">Strategy Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Total Return</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-bg-hover/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-main">{s.name}</div>
                    <div className="text-xs text-text-muted">{s.version}</div>
                  </td>
                  <td className="px-6 py-4 text-text-sub">{s.type}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'Running' ? 'success' : s.status === 'Paused' ? 'warning' : 'info'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className={s.return.startsWith('+') ? "px-6 py-4 text-accent-green" : "px-6 py-4 text-text-muted"}>
                    {s.return}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={s.risk === 'High' ? 'danger' : s.risk === 'Medium' ? 'warning' : 'success'}>
                      {s.risk}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-muted hover:text-accent-blue hover:bg-primary-light rounded transition-colors" title="Backtest">
                        <BarChart size={16} />
                      </button>
                      <button className="p-2 text-text-muted hover:text-white hover:bg-primary-light rounded transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-text-muted hover:text-white hover:bg-primary-light rounded transition-colors" title="Start/Pause">
                        {s.status === 'Running' ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
