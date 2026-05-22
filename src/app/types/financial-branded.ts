/**
 * @file src/app/types/financial-branded.ts
 * @description Branded Types for Financial Safety - Prevents unit confusion (USDCents vs Shares vs Percentage)
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

declare const brandSymbol: unique symbol;

type Brand<T, B extends string> = T & { readonly [brandSymbol]: B };

export type USDCents = Brand<number, 'USDCents'>;
export type USDollars = Brand<number, 'USDollars'>;
export type Shares = Brand<number, 'Shares'>;
export type Percentage = Brand<number, 'Percentage'>;
export type PriceLevel = Brand<number, 'PriceLevel'>;
export type TimestampMs = Brand<number, 'TimestampMs'>;

export function asUSDCents(value: number): USDCents {
  return value as USDCents;
}

export function asUSDollars(value: number): USDollars {
  return value as USDollars;
}

export function asShares(value: number): Shares {
  return value as Shares;
}

export function asPercentage(value: number): Percentage {
  return value as Percentage;
}

export function asPriceLevel(value: number): PriceLevel {
  return value as PriceLevel;
}

export function asTimestampMs(value: number): TimestampMs {
  return value as TimestampMs;
}

export function centsToDollars(cents: USDCents): USDollars {
  return (cents / 100) as USDollars;
}

export function dollarsToCents(dollars: USDollars): USDCents {
  return Math.round(dollars * 100) as USDCents;
}
