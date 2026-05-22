/**
 * @file src/app/components/ui/Skeleton.tsx
 * @description YYC3 Skeleton Loading Components - Phase 2 UX Optimization
 * @author YanYuCloudCube Team
 * @version v2.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 *
 * Core Web Vitals Impact:
 * - CLS Prevention: Fixed dimensions prevent layout shift
 * - LCP Improvement: Lightweight placeholder reduces perceived load time
 * - UX Enhancement: Smooth loading transitions improve user experience
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'shimmer' | 'pulse' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius = '4px',
  variant = 'rectangular',
  animation = 'shimmer',
}) => {
  const baseStyle: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '20px'),
    borderRadius: variant === 'circular' ? '50%' : borderRadius,
  };

  const animationClass =
    animation === 'shimmer'
      ? 'skeleton'
      : animation === 'pulse'
      ? 'animate-pulse bg-[#112240]'
      : 'bg-[#112240]';

  return (
    <div
      className={`${animationClass} ${className}`}
      style={baseStyle}
      aria-hidden="true"
      data-testid="skeleton"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`} aria-busy="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="16px"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-[#0A192F] p-4 rounded-lg border border-[#233554] space-y-3 ${className}`}
    aria-busy="true"
  >
    <Skeleton variant="rectangular" height="120px" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-busy="true">
    <div className="flex gap-4 pb-2 border-b border-[#233554]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" height="14px" width={`${100 / cols}%`} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            height="12px"
            width={colIndex === 0 ? '20%' : `${(100 - 20) / (cols - 1)}%`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-[#0A192F] p-4 rounded-lg border border-[#233554] ${className}`}
    aria-busy="true"
  >
    <div className="flex justify-between mb-4">
      <Skeleton variant="text" width="120px" height="20px" />
      <Skeleton variant="text" width="80px" height="16px" />
    </div>
    <Skeleton variant="rectangular" height="300px" />
    <div className="flex gap-4 mt-4">
      {[25, 40, 35].map((width, i) => (
        <Skeleton key={i} variant="rectangular" height="60px" width={`${width}%`} />
      ))}
    </div>
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => <Skeleton variant="circular" width={size} height={size} className={className} />;

export default Skeleton;
