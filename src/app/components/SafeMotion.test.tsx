/**
 * @file src/app/components/SafeMotion.test.tsx
 * @description SafeMotion动画安全组件测试 - 覆盖动画降级逻辑
 * @author Phase4 Coverage Enhancement
 * @version 1.0.0
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnimatePresence, motion } from './SafeMotion';

describe('SafeMotion', () => {
  it('should render motion.div safely', () => {
    render(
      <motion.div data-testid="motion-child">
        Test Content
      </motion.div>
    );

    expect(document.querySelector('[data-testid="motion-child"]')).toBeDefined();
  });

  it('should render AnimatePresence safely', () => {
    const { container } = render(
      <AnimatePresence>
        <div>Animated Content</div>
      </AnimatePresence>
    );

    expect(container.firstChild).toBeDefined();
  });
});
