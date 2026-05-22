/**
 * @file src/app/components/ErrorBoundary.test.tsx
 * @description Unit tests for ErrorBoundary component
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary, ModuleErrorBoundary, WidgetErrorBoundary } from './ErrorBoundary';

function ThrowingComponent(): React.ReactElement {
  throw new Error('Test render error');
}

function NetworkErrorComponent(): React.ReactElement {
  throw new Error('Failed to fetch data from API');
}

describe('ErrorBoundary', () => {
  it('should catch and display error in full mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallbackMode="full">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/组件渲染错误/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should categorize network errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallbackMode="full">
        <NetworkErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/网络异常/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should show retry button when retries available', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallbackMode="full" maxRetries={3}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /尝试恢复/i });
    expect(retryButton).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should render compact mode correctly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallbackMode="compact" moduleName="test-module">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('(test-module)')).toBeInTheDocument();
    expect(screen.getByText(/重试/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should render inline mode with minimal UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallbackMode="inline" moduleName="widget">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTitle(/test render error/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should render silent mode as null', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const { container } = render(
      <ErrorBoundary fallbackMode="silent">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(container.innerHTML).toBe('');
    consoleSpy.mockRestore();
  });

  it('should use custom fallback if provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallback={<div>Custom Error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

describe('ModuleErrorBoundary', () => {
  it('should use compact mode by default', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ModuleErrorBoundary moduleName="market">
        <ThrowingComponent />
      </ModuleErrorBoundary>
    );

    expect(screen.getByText('(market)')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

describe('WidgetErrorBoundary', () => {
  it('should use inline mode by default', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <WidgetErrorBoundary name="chart-widget">
        <ThrowingComponent />
      </WidgetErrorBoundary>
    );

    expect(screen.getByTitle(/test render error/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
