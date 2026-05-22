import { beforeEach, describe, expect, it } from 'vitest';

import {
  globalErrorHandler
} from '@/app/utils/global-error-handler';

describe('GlobalErrorHandler', () => {
  beforeEach(() => {
    globalErrorHandler.clear();
  });

  describe('Error Classification', () => {
    it('should classify trade execution failures as critical', () => {
      const entry = globalErrorHandler.logError('Trade execution failed');
      expect(entry.severity).toBe('critical');
    });

    it('should classify auth failures as critical', () => {
      const entry = globalErrorHandler.logError('Authentication failed for user');
      expect(entry.severity).toBe('critical');
    });

    it('should classify data corruption as critical', () => {
      const entry = globalErrorHandler.logError('Data corruption detected');
      expect(entry.severity).toBe('critical');
    });

    it('should classify network errors as high severity', () => {
      const entry = globalErrorHandler.logError('Network connection failed', { source: 'network' });
      expect(entry.severity).toBe('high');
    });

    it('should classify React errors as medium', () => {
      const entry = globalErrorHandler.emitReactError(new Error('Render error'));
      expect(entry.severity).toBe('medium');
    });

    it('should classify parse errors as medium', () => {
      const entry = globalErrorHandler.logError('JSON parse error: unexpected token');
      expect(entry.severity).toBe('medium');
    });

    it('should classify unknown errors as low', () => {
      const entry = globalErrorHandler.logError('Something minor happened');
      expect(entry.severity).toBe('low');
    });
  });

  describe('Error Capture Methods', () => {
    it('should capture manual errors via logError', () => {
      const entry = globalErrorHandler.logError('Manual test error');

      expect(entry).toBeDefined();
      expect(entry.message).toBe('Manual test error');
      expect(entry.source).toBe('manual');
      expect(entry.id).toMatch(/^err_/);
      expect(entry.timestamp).toBeGreaterThan(0);
    });

    it('should capture React errors via emitReactError', () => {
      const error = new Error('Component crashed');
      error.stack = 'Error stack trace here';

      const entry = globalErrorHandler.emitReactError(error, 'MyComponent');

      expect(entry.source).toBe('react');
      expect(entry.message).toBe('Component crashed');
      expect(entry.stack).toContain('Error stack trace here');
      expect(entry.module).toBe('MyComponent');
    });

    it('should capture network errors via emitNetworkError', () => {
      const metadata = { url: '/api/test', status: 500 };
      const entry = globalErrorHandler.emitNetworkError('API request failed', metadata);

      expect(entry.source).toBe('network');
      expect(entry.metadata).toEqual(metadata);
    });

    it('should capture API errors with API source', () => {
      const entry = globalErrorHandler.emitApiError('TradeService', 'executeOrder', 'Order failed');

      expect(entry.source).toBe('api');
      expect(entry.message).toContain('TradeService.executeOrder');
      expect(entry.module).toBe('TradeService');
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate same message within window', () => {
      const entry1 = globalErrorHandler.logError('Duplicate error');
      const entry2 = globalErrorHandler.logError('Duplicate error');

      expect(entry1.deduplicated).toBe(false);
      expect(entry2.deduplicated).toBe(true);
    });

    it('should not deduplicate different messages', () => {
      const entry1 = globalErrorHandler.logError('Error A');
      const entry2 = globalErrorHandler.logError('Error B');

      expect(entry1.deduplicated).toBe(false);
      expect(entry2.deduplicated).toBe(false);
    });

    it('should track deduplicated count in stats', () => {
      globalErrorHandler.logError('Dedup test');
      globalErrorHandler.logError('Dedup test');
      globalErrorHandler.logError('Dedup test');

      const stats = globalErrorHandler.getStats();
      expect(stats.deduplicatedCount).toBe(2);
    });
  });

  describe('Statistics & Queries', () => {
    beforeEach(() => {
      globalErrorHandler.logError('Low priority issue');
      globalErrorHandler.emitReactError(new Error('Medium render issue'));
      globalErrorHandler.emitNetworkError('High network failure');
      globalErrorHandler.logError('Trade execution failed'); // Critical
    });

    it('should return correct total error count', () => {
      const stats = globalErrorHandler.getStats();
      expect(stats.totalErrors).toBe(4);
    });

    it('should categorize errors by severity', () => {
      const stats = globalErrorHandler.getStats();
      expect(stats.bySeverity.low).toBeGreaterThan(0);
      expect(stats.bySeverity.medium).toBeGreaterThan(0);
      expect(stats.bySeverity.high).toBeGreaterThan(0);
      expect(stats.bySeverity.critical).toBeGreaterThan(0);
    });

    it('should categorize errors by source', () => {
      const stats = globalErrorHandler.getStats();
      expect(stats.bySource.manual).toBe(2);
      expect(stats.bySource.react).toBe(1);
      expect(stats.bySource.network).toBe(1);
    });

    it('should provide timestamp range', () => {
      const stats = globalErrorHandler.getStats();
      expect(stats.oldestTimestamp).not.toBeNull();
      expect(stats.newestTimestamp).not.toBeNull();
      expect(stats.newestTimestamp!).toBeGreaterThanOrEqual(stats.oldestTimestamp!);
    });

    it('should return recent errors in stats', () => {
      const stats = globalErrorHandler.getStats();
      expect(stats.recentErrors.length).toBe(4);
      expect(stats.recentErrors[0].source).toBeDefined();
    });

    it('should return entries with getEntries', () => {
      const entries = globalErrorHandler.getEntries();
      expect(entries.length).toBe(4);
    });

    it('should limit entries count', () => {
      const entries = globalErrorHandler.getEntries(2);
      expect(entries.length).toBe(2);
    });

    it('should filter errors by severity', () => {
      const criticalErrors = globalErrorHandler.getEntriesBySeverity('critical');
      expect(criticalErrors.length).toBeGreaterThan(0);
      criticalErrors.forEach(err => {
        expect(err.severity).toBe('critical');
      });
    });

    it('should filter errors by source', () => {
      const reactErrors = globalErrorHandler.getEntriesBySource('react');
      expect(reactErrors.length).toBe(1);
      expect(reactErrors[0].source).toBe('react');
    });
  });

  describe('Clear & Reset', () => {
    it('should clear all errors', () => {
      globalErrorHandler.logError('Error 1');
      globalErrorHandler.logError('Error 2');

      globalErrorHandler.clear();

      const stats = globalErrorHandler.getStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.recentErrors.length).toBe(0);
    });

    it('should reset deduplicated count on clear', () => {
      globalErrorHandler.logError('Dup');
      globalErrorHandler.logError('Dup');

      globalErrorHandler.clear();

      const stats = globalErrorHandler.getStats();
      expect(stats.deduplicatedCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long error messages (truncate to 1000 chars)', () => {
      const longMessage = 'x'.repeat(2000);
      const entry = globalErrorHandler.logError(longMessage);

      expect(entry.message.length).toBeLessThanOrEqual(1000);
    });

    it('should handle very long stack traces (truncate to 2000 chars)', () => {
      const longStack = 'y'.repeat(3000);
      const error = new Error('test');
      error.stack = longStack;

      const entry = globalErrorHandler.emitReactError(error);
      expect(entry.stack!.length).toBeLessThanOrEqual(2000);
    });

    it('should handle empty error messages', () => {
      const entry = globalErrorHandler.logError('');
      expect(entry.message).toBe('');
    });

    it('should handle special characters in error messages', () => {
      const specialMsg = 'Error: <script>alert("xss")</script> & "quotes" \'apostrophes\'';
      const entry = globalErrorHandler.logError(specialMsg);
      expect(entry.message).toBe(specialMsg);
    });

    it('should generate unique IDs for each error', () => {
      const entry1 = globalErrorHandler.logError('Error 1');
      const entry2 = globalErrorHandler.logError('Error 2');

      expect(entry1.id).not.toBe(entry2.id);
      expect(entry1.id).toMatch(/^err_\d+/);
      expect(entry2.id).toMatch(/^err_\d+/);
    });

    it('should handle undefined metadata gracefully', () => {
      const entry = globalErrorHandler.emitNetworkError('No metadata');
      expect(entry.metadata).toBeUndefined();
    });

    it('should handle Errors without stack traces', () => {
      const error = new Error('No stack');
      error.stack = undefined;

      const entry = globalErrorHandler.emitReactError(error);
      expect(entry.stack).toBeUndefined();
    });

    it('should accept custom severity option', () => {
      const entry = globalErrorHandler.logError('Custom severity', {
        severity: 'high',
        source: 'manual'
      });
      expect(entry.severity).toBe('high');
    });

    it('should accept custom module option', () => {
      const entry = globalErrorHandler.logError('Module error', {
        module: 'TradingEngine',
        source: 'api'
      });
      expect(entry.module).toBe('TradingEngine');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid burst of errors', () => {
      // Simulate 20 rapid errors (some duplicates)
      for (let i = 0; i < 20; i++) {
        globalErrorHandler.logError(i % 5 === 0 ? 'Repeated error' : `Unique error ${i}`);
      }

      const stats = globalErrorHandler.getStats();
      expect(stats.totalErrors).toBe(20);
      expect(stats.deduplicatedCount).toBeGreaterThan(0); // Some deduplication
    });

    it('should maintain insertion order (newest first)', () => {
      globalErrorHandler.logError('First');
      globalErrorHandler.logError('Second');
      globalErrorHandler.logError('Third');

      const errors = globalErrorHandler.getEntries(10);
      expect(errors[0].message).toBe('Third');
      expect(errors[1].message).toBe('Second');
      expect(errors[2].message).toBe('First');
    });

    it('should work with React ErrorBoundary pattern', () => {
      // Simulate React ErrorBoundary componentDidCatch
      try {
        throw new Error('Virtual DOM crash');
      } catch (error) {
        if (error instanceof Error) {
          globalErrorHandler.emitReactError(error, 'ErrorBoundary');
        }
      }

      const reactErrors = globalErrorHandler.getEntriesBySource('react');
      expect(reactErrors.length).toBe(1);
      expect(reactErrors[0].module).toBe('ErrorBoundary');
    });
  });
});
