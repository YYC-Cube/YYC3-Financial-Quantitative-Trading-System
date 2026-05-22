/**
 * @file src/app/components/ui/LazyChart.tsx
 * @description Lazy-loaded Chart Component with Code Splitting
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 *
 * Optimization Strategy:
 * - Dynamic import of Recharts (reduces initial bundle by ~150-200KB)
 * - React.lazy() + Suspense for code splitting
 * - Skeleton fallback during loading
 */

import React, { Suspense, lazy } from 'react';

import Skeleton from './skeleton';

const ChartContainer = lazy(() =>
  import('./chart').then((mod) => ({ default: mod.ChartContainer }))
);

interface LazyChartProps {
  children: React.ReactElement;
  config?: Record<string, any>;
  className?: string;
  id?: string;
}

const LazyChart: React.FC<LazyChartProps> = ({
  children,
  config = {},
  className,
  id,
}) => {
  const fallbackElement = (
    <div className={`w-full aspect-video ${className || ''}`}>
      <Skeleton variant="rectangular" height="100%" />
    </div>
  );

  return (
    <Suspense fallback={fallbackElement as any}>
      <ChartContainer id={id} config={config} className={className}>
        {children}
      </ChartContainer>
    </Suspense>
  );
};

export default LazyChart;
