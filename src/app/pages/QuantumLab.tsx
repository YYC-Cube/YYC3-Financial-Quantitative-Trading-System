import React from 'react';
import { Card } from '@/app/components/ui/Card';

export default function QuantumLab() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-text-main">量子计算实验室</h1>
      <Card className="h-96 flex flex-col items-center justify-center text-text-muted">
        <div className="text-6xl mb-4">⚛️</div>
        <p>Quantum Algorithm Simulation Environment</p>
        <p className="text-sm mt-2">Connecting to QPU...</p>
      </Card>
    </div>
  );
}
