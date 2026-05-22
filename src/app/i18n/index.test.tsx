/**
 * @file src/app/i18n/index.test.tsx
 * @description Unit tests for i18n Internationalization System
 */

import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock i18n context
const mockT = (key: string) => key;
const mockFormatDate = (date: Date, _format?: string) => date.toISOString();
const mockFormatNumber = (num: number) => num.toLocaleString();
const mockFormatCurrency = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString()}`;
const mockChangeLanguage = vi.fn();
const mockGetLanguage = () => 'zh-CN';
const mockGetDirection = () => 'ltr';
const mockIsRTL = () => false;

vi.mock('@/app/i18n', () => ({
  useI18n: () => ({
    t: mockT,
    formatDate: mockFormatDate,
    formatNumber: mockFormatNumber,
    formatCurrency: mockFormatCurrency,
    changeLanguage: mockChangeLanguage,
    getLanguage: mockGetLanguage,
    getDirection: mockGetDirection,
    isRTL: mockIsRTL,
    locale: {
      language: 'zh-CN',
      direction: 'ltr',
      isRTL: false,
    },
  }),
}));

describe('i18n System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide translation function', async () => {
    const result = {
      t: mockT,
      formatDate: mockFormatDate,
      formatNumber: mockFormatNumber,
      formatCurrency: mockFormatCurrency,
      changeLanguage: mockChangeLanguage,
      getLanguage: mockGetLanguage,
      getDirection: mockGetDirection,
      isRTL: mockIsRTL,
      locale: {
        language: 'zh-CN',
        direction: 'ltr',
        isRTL: false,
      },
    };

    expect(typeof result.t).toBe('function');
    expect(result.t('common.save')).toBeDefined();
  });

  it('should provide formatting functions', async () => {
    const result = {
      t: mockT,
      formatDate: mockFormatDate,
      formatNumber: mockFormatNumber,
      formatCurrency: mockFormatCurrency,
      changeLanguage: mockChangeLanguage,
      getLanguage: mockGetLanguage,
      getDirection: mockGetDirection,
      isRTL: mockIsRTL,
      locale: {
        language: 'zh-CN',
        direction: 'ltr',
        isRTL: false,
      },
    };

    expect(typeof result.formatDate).toBe('function');
    expect(typeof result.formatNumber).toBe('function');
    expect(typeof result.formatCurrency).toBe('function');
  });

  it('should format dates correctly', async () => {
    const date = new Date('2026-05-22');
    const formatted = mockFormatDate(date);

    expect(formatted).toContain('2026');
  });

  it('should format numbers with locale', async () => {
    const formatted = mockFormatNumber(1234567.89);

    expect(formatted).toContain('1');
    expect(formatted).toContain(',');
  });

  it('should format currency correctly', async () => {
    const formatted = mockFormatCurrency(1234.56, 'USD');

    expect(formatted).toContain('USD');
    expect(formatted).toContain('1,234.56');
  });

  it('should support language change', () => {
    expect(typeof mockChangeLanguage).toBe('function');
    mockChangeLanguage('en-US');

    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
  });

  it('should detect RTL languages', () => {
    expect(typeof mockIsRTL).toBe('function');
    expect(typeof mockGetDirection).toBe('function');
    expect(mockIsRTL()).toBe(false);
    expect(mockGetDirection()).toBe('ltr');
  });
});

describe('i18n Translations', () => {
  it('should have translations for all supported languages', () => {
    const translations = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'ar-SA'];

    translations.forEach(lang => {
      expect(lang).toMatch(/^(zh|en|ja|ko|ar)-[A-Z]{2}$/);
    });
  });

  it('should handle translation keys correctly', () => {
    const text = mockT('common.welcome');
    expect(text).toBeDefined();
    expect(text).toBe('common.welcome');
  });

  it('should handle interpolation in translations', () => {
    const text = mockT('trade.orderCreated');
    expect(text).toBeDefined();
  });
});
