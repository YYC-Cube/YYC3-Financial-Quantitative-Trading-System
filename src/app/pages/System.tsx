import React from 'react';
import { Card } from '@/app/components/ui/Card';

export default function System() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-text-main">系统管理后台</h1>
      <Card className="h-96 flex items-center justify-center text-text-muted border-dashed">
        System Configuration & User Management
      </Card>
    </div>
  );
}
