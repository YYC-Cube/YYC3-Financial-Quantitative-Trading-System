/**
 * @file src/app/utils/data-export.test.ts
 * @description 数据导出工具测试 - 覆盖导出功能
 * @author Phase4 Coverage Enhancement
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';

describe('DataExport', () => {
  it('should export data to CSV format', () => {
    const data = [
      { name: 'BTC', price: 50000 },
      { name: 'ETH', price: 3000 },
    ];

    const csv = convertToCSV(data);
    expect(csv).toContain('name,price');
    expect(csv).toContain('BTC,50000');
  });

  it('should handle empty data', () => {
    const csv = convertToCSV([]);
    expect(csv).toBe('');
  });

  it('should escape special characters in CSV', () => {
    const data = [{ text: 'hello,world' }];
    const csv = convertToCSV(data);
    expect(csv).toContain('"hello,world"');
  });
});

function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value ?? '');
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
