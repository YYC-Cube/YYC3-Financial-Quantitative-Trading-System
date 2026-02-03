import React from 'react';
import { Card } from '@/app/components/ui/Card';

export default function RiskControl() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-text-main">风险管控中台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="h-64 flex items-center justify-center text-text-muted border-dashed">
          Risk Dashboard Placeholder
        </Card>
        <Card className="h-64 flex items-center justify-center text-text-muted border-dashed">
          VaR Calculation
        </Card>
        <Card className="h-64 flex items-center justify-center text-text-muted border-dashed">
          Exposure Analysis
        </Card>
      </div>
    </div>
  );
}
