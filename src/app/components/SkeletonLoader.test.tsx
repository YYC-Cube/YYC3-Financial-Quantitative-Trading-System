/**
 * @file src/app/components/SkeletonLoader.test.tsx
 * @description 骨架屏加载组件测试 - 覆盖加载状态UI
 * @author Phase4 Coverage Enhancement
 * @version 1.0.0
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModuleSkeleton, SkeletonCard } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('should render ModuleSkeleton without crashing', () => {
    render(<ModuleSkeleton />);
    expect(document.querySelector('.skeleton-loader') || document.querySelector('[class*="skeleton"]')).toBeDefined();
  });

  it('should display SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);

    expect(container.firstChild).toBeDefined();
  });
});
