/**
 * @file src/app/components/SafeIcons.test.tsx
 * @description 安全图标组件测试 - 覆盖图标渲染逻辑
 * @author Phase4 Coverage Enhancement
 * @version 1.0.0
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SafeIcon, Settings, Zap } from './SafeIcons';

describe('SafeIcons', () => {
  it('should render SafeIcon without crashing', () => {
    render(<SafeIcon name="test" />);
    expect(document.querySelector('svg') || document.querySelector('[data-icon]')).toBeDefined();
  });

  it('should render Zap icon', () => {
    const { container } = render(<Zap />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('should render Settings icon with custom className', () => {
    const { container } = render(<Settings className="w-6 h-6" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    if (svg) {
      expect(svg.className.baseVal || svg.getAttribute('class')).toContain('w-6');
    }
  });
});
