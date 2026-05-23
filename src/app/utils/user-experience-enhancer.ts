/**
 * @file src/app/utils/user-experience-enhancer.ts
 * @description 用户体验增强器 - 提供智能反馈和用户引导
 * @author Phase5 UX Optimization
 * @version 1.0.0
 */

interface UserFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UserGuideStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

class UserExperienceEnhancer {
  private feedbackQueue: UserFeedback[] = [];
  private isShowingFeedback = false;
  private guideSteps: UserGuideStep[] = [];
  private currentStepIndex = -1;

  showFeedback(feedback: UserFeedback): void {
    this.feedbackQueue.push(feedback);

    if (!this.isShowingFeedback) {
      this.processFeedbackQueue();
    }
  }

  private processFeedbackQueue(): void {
    if (this.feedbackQueue.length === 0) {
      this.isShowingFeedback = false;
      return;
    }

    this.isShowingFeedback = true;
    const feedback = this.feedbackQueue.shift()!;

    this.displayFeedbackNotification(feedback);

    setTimeout(() => {
      this.hideFeedbackNotification();
      this.processFeedbackQueue();
    }, feedback.duration || 3000);
  }

  private displayFeedbackNotification(feedback: UserFeedback): void {
    const notification = document.createElement('div');
    notification.className = `ux-feedback ux-feedback-${feedback.type}`;

    const content = document.createElement('div');
    content.className = 'ux-feedback-content';

    const message = document.createElement('span');
    message.className = 'ux-feedback-message';
    message.textContent = feedback.message;
    content.appendChild(message);

    if (feedback.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'ux-feedback-action';
      actionBtn.textContent = feedback.action.label;
      actionBtn.addEventListener('click', () => {
        feedback.action!.onClick();
        this.hideFeedbackNotification();
      });
      content.appendChild(actionBtn);
    }

    notification.appendChild(content);
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('ux-feedback-visible');
    });
  }

  private hideFeedbackNotification(): void {
    const notification = document.querySelector('.ux-feedback');
    if (notification) {
      notification.classList.remove('ux-feedback-visible');
      setTimeout(() => notification.remove(), 300);
    }
  }

  startUserGuide(steps: UserGuideStep[]): void {
    this.guideSteps = steps;
    this.currentStepIndex = 0;
    this.showCurrentGuideStep();
  }

  private showCurrentGuideStep(): void {
    if (this.currentStepIndex >= this.guideSteps.length) {
      this.completeUserGuide();
      return;
    }

    const step = this.guideSteps[this.currentStepIndex];
    const targetElement = document.querySelector(step.target);

    if (!targetElement) {
      console.warn(`Target element not found: ${step.target}`);
      this.nextGuideStep();
      return;
    }

    this.highlightGuideTarget(targetElement, step);
    this.showGuideTooltip(step, targetElement);
  }

  private highlightGuideTarget(element: Element, _step: UserGuideStep): void {
    element.classList.add('ux-guide-highlight');

    const overlay = document.createElement('div');
    overlay.className = 'ux-guide-overlay';
    overlay.id = 'ux-guide-overlay';

    document.body.appendChild(overlay);
  }

  private showGuideTooltip(step: UserGuideStep, _targetElement: Element): void {
    const tooltip = document.createElement('div');
    tooltip.className = `ux-guide-tooltip ux-guide-tooltip-${step.position || 'bottom'}`;

    const header = document.createElement('div');
    header.className = 'ux-guide-header';
    const title = document.createElement('h3');
    title.textContent = step.title;
    const indicator = document.createElement('span');
    indicator.className = 'ux-guide-step-indicator';
    indicator.textContent = `${this.currentStepIndex + 1}/${this.guideSteps.length}`;
    header.appendChild(title);
    header.appendChild(indicator);
    tooltip.appendChild(header);

    const guideContent = document.createElement('div');
    guideContent.className = 'ux-guide-content';
    guideContent.textContent = step.content;
    tooltip.appendChild(guideContent);

    const footer = document.createElement('div');
    footer.className = 'ux-guide-footer';

    if (this.currentStepIndex > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'ux-guide-prev';
      prevBtn.textContent = '上一步';
      footer.appendChild(prevBtn);
    }

    if (step.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'ux-guide-action';
      actionBtn.textContent = step.action.label;
      actionBtn.addEventListener('click', () => step.action!.onClick());
      footer.appendChild(actionBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'ux-guide-next';
    nextBtn.textContent = this.currentStepIndex === this.guideSteps.length - 1 ? '完成' : '下一步';
    footer.appendChild(nextBtn);
    tooltip.appendChild(footer);

    document.body.appendChild(tooltip);

    nextBtn.addEventListener('click', () => this.nextGuideStep());

    const prevBtn = tooltip.querySelector('.ux-guide-prev');
    prevBtn?.addEventListener('click', () => this.prevGuideStep());

    if (step.action) {
      const actionBtn = tooltip.querySelector('.ux-guide-action');
      actionBtn?.addEventListener('click', step.action.onClick);
    }
  }

  nextGuideStep(): void {
    this.cleanupCurrentGuide();
    this.currentStepIndex++;
    this.showCurrentGuideStep();
  }

  prevGuideStep(): void {
    this.cleanupCurrentGuide();
    this.currentStepIndex--;
    this.showCurrentGuideStep();
  }

  private cleanupCurrentGuide(): void {
    const overlay = document.getElementById('ux-guide-overlay');
    overlay?.remove();

    const tooltip = document.querySelector('.ux-guide-tooltip');
    tooltip?.remove();

    const highlighted = document.querySelector('.ux-guide-highlight');
    highlighted?.classList.remove('ux-guide-highlight');
  }

  private completeUserGuide(): void {
    this.showFeedback({
      type: 'success',
      message: '🎉 恭喜！您已完成新手引导',
      duration: 2000,
    });

    localStorage.setItem('user-guide-completed', 'true');
  }

  trackUserInteraction(eventType: string, data?: Record<string, unknown>): void {
    const interactionData = {
      timestamp: new Date().toISOString(),
      eventType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data,
    };

    console.log('[UX Tracker]', interactionData);

    if (typeof window !== 'undefined' && window.localStorage) {
      const interactions = JSON.parse(localStorage.getItem('user-interactions') || '[]');
      interactions.push(interactionData);

      if (interactions.length > 100) {
        interactions.shift();
      }

      localStorage.setItem('user-interactions', JSON.stringify(interactions));
    }
  }

  getPerformanceMetrics(): { pageLoadTime: number; interactionCount: number; errorRate: number } {
    const interactions = JSON.parse(localStorage.getItem('user-interactions') || '[]');
    const errors = interactions.filter((i: { eventType: string }) => i.eventType === 'error');

    return {
      pageLoadTime: performance.now(),
      interactionCount: interactions.length,
      errorRate: interactions.length > 0 ? errors.length / interactions.length : 0,
    };
  }
}

const userExperienceEnhancer = new UserExperienceEnhancer();

export default userExperienceEnhancer;
export type { UserFeedback, UserGuideStep };
