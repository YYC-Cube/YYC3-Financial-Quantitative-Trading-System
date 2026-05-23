/**
 * @file src/app/types/financial-branded.test.ts
 * @description Unit tests for Financial Branded Types
 */

import { describe, it, expect } from 'vitest';

import {
  asUSDCents,
  asUSDollars,
  asShares,
  asPercentage,
  centsToDollars,
  dollarsToCents,
} from './financial-branded';

describe('Financial Branded Types', () => {
  describe('Type Creation Functions', () => {
    it('should create USDCents type', () => {
      const cents = asUSDCents(19900);
      expect(cents).toBe(19900);
      expect(typeof cents).toBe('number');
    });

    it('should create USDollars type', () => {
      const dollars = asUSDollars(199);
      expect(dollars).toBe(199);
      expect(typeof dollars).toBe('number');
    });

    it('should create Shares type', () => {
      const shares = asShares(100);
      expect(shares).toBe(100);
      expect(typeof shares).toBe('number');
    });

    it('should create Percentage type', () => {
      const pct = asPercentage(5.5);
      expect(pct).toBe(5.5);
      expect(typeof pct).toBe('number');
    });
  });

  describe('Conversion Functions', () => {
    it('should convert cents to dollars correctly', () => {
      const cents = asUSDCents(19900);
      const dollars = centsToDollars(cents);
      expect(dollars).toBe(199);
    });

    it('should convert dollars to cents correctly', () => {
      const dollars = asUSDollars(199);
      const cents = dollarsToCents(dollars);
      expect(cents).toBe(19900);
    });

    it('should handle zero values', () => {
      expect(centsToDollars(asUSDCents(0))).toBe(0);
      expect(dollarsToCents(asUSDollars(0))).toBe(0);
    });

    it('should handle decimal dollar amounts', () => {
      const dollars = asUSDollars(19.99);
      const cents = dollarsToCents(dollars);
      expect(cents).toBe(1999);
    });
  });

  describe('Financial Precision', () => {
    it('should maintain precision in conversions', () => {
      const testCases = [
        { cents: 100, dollars: 1 },
        { cents: 150, dollars: 1.5 },
        { cents: 999, dollars: 9.99 },
        { cents: 100000, dollars: 1000 },
      ];

      testCases.forEach(({ cents, dollars }) => {
        expect(centsToDollars(asUSDCents(cents))).toBeCloseTo(dollars, 10);
        expect(dollarsToCents(asUSDollars(dollars))).toBe(cents);
      });
    });
  });
});
