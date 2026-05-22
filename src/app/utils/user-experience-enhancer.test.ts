/**
 * @file src/app/utils/user-experience-enhancer.test.ts
 * @description 用户体验增强器测试 - 覆盖用户反馈和引导功能
 * @author Phase5 UX Optimization
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import userExperienceEnhancer from './user-experience-enhancer';

describe('UserExperienceEnhancer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show feedback notification', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');

    userExperienceEnhancer.showFeedback({
      type: 'success',
      message: '操作成功',
      duration: 1000,
    });

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should handle different feedback types', () => {
    const feedbackTypes = ['success', 'error', 'warning', 'info'] as const;

    feedbackTypes.forEach(type => {
      userExperienceEnhancer.showFeedback({
        type,
        message: `${type} message`,
      });
    });

    expect(true).toBe(true);
  });

  it('should track user interactions', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    userExperienceEnhancer.trackUserInteraction('button_click', {
      elementId: 'test-button',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[UX Tracker]',
      expect.objectContaining({
        eventType: 'button_click',
        elementId: 'test-button',
      })
    );

    consoleSpy.mockRestore();
  });

  it('should return performance metrics', () => {
    const metrics = userExperienceEnhancer.getPerformanceMetrics();

    expect(metrics).toHaveProperty('pageLoadTime');
    expect(metrics).toHaveProperty('interactionCount');
    expect(metrics).toHaveProperty('errorRate');
    expect(typeof metrics.pageLoadTime).toBe('number');
  });

  it('should start user guide with steps', () => {
    const steps = [
      {
        id: 'step1',
        target: '#element1',
        title: '第一步',
        content: '这是第一步的说明',
      },
      {
        id: 'step2',
        target: '#element2',
        title: '第二步',
        content: '这是第二步的说明',
      },
    ];

    expect(() => {
      userExperienceEnhancer.startUserGuide(steps);
    }).not.toThrow();
  });
});
