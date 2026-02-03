import React from 'react';
import { Card } from '@/app/components/ui/Card';

export default function ModelWorkshop() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-text-main">量化模型工坊</h1>
      <Card className="h-96 flex items-center justify-center text-text-muted border-dashed">
        Model Training & Evaluation
      </Card>
    </div>
  );
}
