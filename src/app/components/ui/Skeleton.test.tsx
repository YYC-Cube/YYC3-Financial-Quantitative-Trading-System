/**
 * @file src/app/components/ui/Skeleton.test.tsx
 * @description Unit tests for Skeleton Loading Components
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Skeleton, {
  SkeletonAvatar,
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonText,
} from './skeleton';

describe('Skeleton Components', () => {
  it('should render default Skeleton', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should render with custom dimensions', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('50px');
  });

  it('should render circular variant', () => {
    const { container } = render(<Skeleton variant="circular" width={40} height={40} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.borderRadius).toBe('50%');
  });

  it('should render text variant', () => {
    const { container } = render(<Skeleton variant="text" height="16px" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.height).toBe('16px');
  });

  it('SkeletonText should render multiple lines', () => {
    render(<SkeletonText lines={3} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('SkeletonCard should render card structure', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
  });

  it('SkeletonTable should render rows and columns', () => {
    render(<SkeletonTable rows={3} cols={4} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(12);
  });

  it('SkeletonChart should render chart placeholder', () => {
    const { container } = render(<SkeletonChart />);
    expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
  });

  it('SkeletonAvatar should be circular', () => {
    const { container } = render(<SkeletonAvatar size={32} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.borderRadius).toBe('50%');
  });
});
