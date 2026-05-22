/**
 * @file src/app/components/PerformanceMonitor.tsx
 * @description Real-time Core Web Vitals Dashboard - Phase 2 UX Optimization
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 *
 * Features:
 * - Real-time Web Vitals display (LCP, FID, CLS, INP)
 * - Performance scoring with color-coded indicators
 * - Historical metrics tracking
 * - Dev-only visibility (hidden in production)
 */

import React, { useEffect, useState } from 'react';

import { getVitalsSummary } from '@/app/utils/web-vitals';

interface VitalCardProps {
  name: string;
  value: number;
  unit: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

const VitalCard: React.FC<VitalCardProps> = ({ name, value, unit, rating, threshold }) => {
  const colors = {
    good: 'text-[#38B2AC] border-[#38B2AC]',
    'needs-improvement': 'text-[#ECC94B] border-[#ECC94B]',
    poor: 'text-[#F56565] border-[#F56565]',
  };

  const percentage = Math.min((value / threshold.poor) * 100, 100);

  return (
    <div className={`bg-[#112240] p-3 rounded border ${colors[rating]} space-y-2`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#8892B0] font-medium">{name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors[rating].split(' ')[0]} bg-opacity-10`}>
          {rating === 'good' ? '优秀' : rating === 'needs-improvement' ? '需改进' : '差'}
        </span>
      </div>
      <div className="text-lg font-mono font-bold">
        {value.toFixed(value < 10 ? 1 : 0)}
        <span className="text-xs text-[#8892B0] ml-1">{unit}</span>
      </div>
      <div className="w-full bg-[#0A192F] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${rating === 'good'
              ? 'bg-[#38B2AC]'
              : rating === 'needs-improvement'
                ? 'bg-[#ECC94B]'
                : 'bg-[#F56565]'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [summary, setSummary] = useState(getVitalsSummary());

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__YYC3_DEV__) {
      setIsVisible(true);

      const interval = setInterval(() => {
        setSummary(getVitalsSummary());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible) return null;

  const vitals = summary.metrics;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#071425] border border-[#233554] rounded-lg p-4 shadow-2xl max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-[#CCD6F6]">⚡ 性能监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[#8892B0] hover:text-[#CCD6F6] text-xs"
          aria-label="关闭性能监控"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {vitals['LCP'] && (
          <VitalCard
            name="LCP"
            value={vitals['LCP'].value}
            unit="ms"
            rating={vitals['LCP'].rating as any}
            threshold={{ good: 2500, poor: 4000 }}
          />
        )}
        {vitals['FID'] && (
          <VitalCard
            name="FID"
            value={vitals['FID'].value}
            unit="ms"
            rating={vitals['FID'].rating as any}
            threshold={{ good: 100, poor: 300 }}
          />
        )}
        {vitals['CLS'] && (
          <VitalCard
            name="CLS"
            value={vitals['CLS'].value}
            unit=""
            rating={vitals['CLS'].rating as any}
            threshold={{ good: 0.1, poor: 0.25 }}
          />
        )}
        {vitals['INP'] && (
          <VitalCard
            name="INP"
            value={vitals['INP'].value}
            unit="ms"
            rating={vitals['INP'].rating as any}
            threshold={{ good: 200, poor: 500 }}
          />
        )}
      </div>

      <div className="text-xs text-[#8892B0] pt-2 border-t border-[#233554]">
        <div className="flex justify-between">
          <span>总指标数:</span>
          <span className="text-[#CCD6F6]">{summary.count}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>平均评分:</span>
          <span className={
            summary.averageRating === 'good'
              ? 'text-[#38B2AC]'
              : summary.averageRating === 'needs-improvement'
                ? 'text-[#ECC94B]'
                : 'text-[#F56565]'
          }>
            {summary.averageRating.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
