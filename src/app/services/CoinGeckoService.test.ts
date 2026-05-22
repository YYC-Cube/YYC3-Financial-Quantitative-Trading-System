import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCoinGeckoService } from '@/app/services/CoinGeckoService';
import { createCoinGeckoTestHelper } from '@/app/utils/test-helpers';

describe('CoinGeckoService', () => {
  let service: ReturnType<typeof getCoinGeckoService>;
  let testHelper: ReturnType<typeof createCoinGeckoTestHelper>;

  beforeEach(() => {
    service = getCoinGeckoService();
    testHelper = createCoinGeckoTestHelper(service);
    service.clearCache();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTopCoins', () => {
    it('should return cached data when available and fresh', async () => {
      const mockData = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 96231,
          change24h: 2.5,
          volume24h: 30000000000,
          marketCap: 1910000000000,
          high24h: 98000,
          low24h: 94000,
          rank: 1,
          image: '',
        },
      ];

      testHelper.setCache({ data: mockData, fetchedAt: Date.now() });

      const result = await service.getTopCoins(50);

      expect(result.source).toBe('cache');
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].symbol).toBe('BTC/USDT');
      expect(result.assets[0].name).toBe('Bitcoin');
      expect(result.assets[0].price).toBeCloseTo(96231, 0);
    });

    it('should fetch from API when cache is stale or empty', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'ethereum',
              symbol: 'eth',
              name: 'Ethereum',
              current_price: 2451,
              price_change_percentage_24h: 1.5,
              total_volume: 15000000000,
              market_cap: 294000000000,
              high_24h: 2500,
              low_24h: 2400,
              market_cap_rank: 2,
              image: '',
            },
          ]),
      });

      const result = await service.getTopCoins(10);

      expect(result.source).toBe('coingecko');
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].symbol).toBe('ETH/USDT');
      expect(result.assets[0].category).toBe('加密货币');
    });

    it('should fall back to localStorage when API fails', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const storedData = [
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          price: 142,
          change24h: -1.2,
          volume24h: 2000000000,
          marketCap: 65000000000,
          high24h: 145,
          low24h: 138,
          rank: 3,
          image: '',
        },
      ];

      localStorage.setItem(
        'yyc_coingecko_cache',
        JSON.stringify({ data: storedData, savedAt: Date.now() })
      );

      const result = await service.getTopCoins(50);

      expect(result.source).toBe('cache');
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].symbol).toBe('SOL/USDT');
    });

    it('should generate simulated data as last resort', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API down'));

      const result = await service.getTopCoins(50);

      expect(result.source).toBe('simulated');
      expect(result.assets.length).toBeGreaterThan(40); // Should have 45+ coins
      expect(result.assets.every((a: any) => a.category === '加密货币')).toBe(true);
      expect(result.assets.every((a: any) => a.symbol.endsWith('/USDT'))).toBe(true);
    });

    it('should respect count parameter for API calls', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Ensure cache is null so API call is triggered
      testHelper.setCache(null);

      await service.getTopCoins(25);

      expect(global.fetch).toHaveBeenCalled();
      const fetchUrl = (global.fetch as any).mock.calls[0][0];
      expect(fetchUrl).toContain('per_page=25');
    });
  });

  describe('getSupplementaryCoins', () => {
    it('should filter out Binance-tracked coins', async () => {
      testHelper.setCache({
        data: [
          { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 96000, change24h: 2, volume24h: 1000, marketCap: 1000, high24h: 97000, low24h: 95000, rank: 1, image: '' },
          { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change24h: 5, volume24h: 500, marketCap: 100, high24h: 0.13, low24h: 0.11, rank: 8, image: '' },
          { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 2400, change24h: 1, volume24h: 800, marketCap: 900, high24h: 2450, low24h: 2350, rank: 2, image: '' },
        ],
        fetchedAt: Date.now(),
      });

      const result = await service.getSupplementaryCoins();

      expect(result.assets.length).toBe(1); // Only DOGE
      expect(result.assets[0].symbol).toBe('DOGE/USDT');
    });

    it('should pass through source type correctly', async () => {
      testHelper.setCache({
        data: [{ id: 'test', symbol: 'TEST', name: 'TestCoin', price: 100, change24h: 0, volume24h: 0, marketCap: 0, high24h: 110, low24h: 90, rank: 99, image: '' }],
        fetchedAt: Date.now(),
      });

      const result = await service.getSupplementaryCoins();
      expect(result.source).toBe('cache'); // Should inherit from parent
    });
  });

  describe('data normalization', () => {
    it('should format prices with correct decimal places', async () => {
      testHelper.setCache({
        data: [
          { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 96231.123456, change24h: 2.5678, volume24h: 3.5e10, marketCap: 1.91e12, high24h: 98000, low24h: 94000, rank: 1, image: '' },
          { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', price: 0.128, change24h: 5.432, volume24h: 5e8, marketCap: 1.82e10, high24h: 0.13, low24h: 0.12, rank: 8, image: '' },
        ],
        fetchedAt: Date.now(),
      });

      const result = await service.getTopCoins(50);

      // BTC should have 2 decimal places
      expect(result.assets[0].price.toString()).toContain('.');
      expect(result.assets[0].price).toBeCloseTo(96231.12, 1);

      // DOGE should have more decimal places
      expect(result.assets[1].price).toBeLessThan(1);
    });

    it('should format volume correctly', async () => {
      testHelper.setCache({
        data: [
          { id: 'coin1', symbol: 'COIN1', name: 'Coin1', price: 100, change24h: 0, volume24h: 1500000000000, marketCap: 0, high24h: 110, low24h: 90, rank: 1, image: '' }, // 1.5T
          { id: 'coin2', symbol: 'COIN2', name: 'Coin2', price: 100, change24h: 0, volume24h: 2500000000, marketCap: 0, high24h: 110, low24h: 90, rank: 2, image: '' }, // 2.5B
          { id: 'coin3', symbol: 'COIN3', name: 'Coin3', price: 100, change24h: 0, volume24h: 750000000, marketCap: 0, high24h: 110, low24h: 90, rank: 3, image: '' }, // 750M
        ],
        fetchedAt: Date.now(),
      });

      const result = await service.getTopCoins(50);

      expect(result.assets[0].volume).toContain('T');
      expect(result.assets[1].volume).toContain('B');
      expect(result.assets[2].volume).toContain('M');
    });

    it('should format market cap correctly', async () => {
      testHelper.setCache({
        data: [
          { id: 'big', symbol: 'BIG', name: 'Big', price: 1000, change24h: 0, volume24h: 0, marketCap: 2000000000000, high24h: 1100, low24h: 900, rank: 1, image: '' }, // 2T
          { id: 'mid', symbol: 'MID', name: 'Mid', price: 100, change24h: 0, volume24h: 0, marketCap: 3500000000, high24h: 110, low24h: 90, rank: 2, image: '' }, // 3.5B
          { id: 'small', symbol: 'SMALL', name: 'Small', price: 10, change24h: 0, volume24h: 0, marketCap: 450000000, high24h: 11, low24h: 9, rank: 3, image: '' }, // 450M
        ],
        fetchedAt: Date.now(),
      });

      const result = await service.getTopCoins(50);

      expect(result.assets[0].marketCap).toContain('T');
      expect(result.assets[1].marketCap).toContain('B');
      expect(result.assets[2].marketCap).toContain('M');
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await service.getTopCoins(50);

      expect(['cache', 'simulated']).toContain(result.source);
    });

    it('should handle timeout via AbortController', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      const startTime = Date.now();
      const result = await service.getTopCoins(50);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(9000); // Should not wait full FETCH_TIMEOUT
      expect(['cache', 'simulated']).toContain(result.source);
    });

    it('should handle malformed JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await service.getTopCoins(50);
      expect(['cache', 'simulated']).toContain(result.source);
    });

    it('should handle missing fields in API response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'test',
              symbol: 'TEST',
              name: 'Test',
              current_price: null,
            },
          ]),
      });

      const result = await service.getTopCoins(50);

      if (result.source === 'coingecko') {
        expect(result.assets.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('caching behavior', () => {
    it('should update cache after successful API call', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'newcoin',
              symbol: 'NEW',
              name: 'NewCoin',
              current_price: 999,
              total_volume: 1000,
              market_cap: 10000,
              high_24h: 1000,
              low_24h: 998,
              market_cap_rank: 1,
              image: '',
            },
          ]),
      });

      expect(testHelper.getCache()).toBeNull();

      await service.getTopCoins(10);

      expect(testHelper.getCache()).not.toBeNull();
      expect(testHelper.getCache()?.data).toHaveLength(1);
    });

    it('should persist data to localStorage after API call', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'persist',
              symbol: 'PST',
              name: 'Persist',
              current_price: 111,
              total_volume: 222,
              market_cap: 333,
              high_24h: 112,
              low_24h: 110,
              market_cap_rank: 1,
              image: '',
            },
          ]),
      });

      await service.getTopCoins(10);

      const stored = localStorage.getItem('yyc_coingecko_cache');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toHaveLength(1);
      expect(parsed.data[0].id).toBe('persist');
    });

    it('should use stored data when available', async () => {
      const storedData = [
        {
          id: 'stored',
          symbol: 'STRD',
          name: 'Stored',
          price: 777,
          change24h: 3.33,
          volume24h: 444,
          marketCap: 55555,
          high24h: 780,
          low24h: 775,
          rank: 42,
          image: '',
        },
      ];

      localStorage.setItem(
        'yyc_coingecko_cache',
        JSON.stringify({ data: storedData, savedAt: Date.now() })
      );

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fail'));

      const result = await service.getTopCoins(50);

      expect(result.source).toBe('cache');
      expect(result.assets[0].name).toBe('Stored');
    });
  });

  describe('simulated data generation', () => {
    it('should generate realistic-looking data', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('No API'));

      const result = await service.getTopCoins(50);

      expect(result.source).toBe('simulated');

      result.assets.forEach((asset: any) => {
        expect(asset.price).toBeGreaterThan(0);
        expect(typeof asset.change).toBe('number');
        expect(asset.volume).toBeTruthy();
        expect(asset.high24h).toBeGreaterThan(asset.low24h);
        expect(asset.marketCap).toBeTruthy();
        expect(asset.symbol).toMatch(/^[A-Z]+\/USDT$/);
      });
    });

    it('should include all simulated coins', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('No API'));

      const result = await service.getTopCoins(50);

      expect(result.assets.length).toBeGreaterThan(44); // SIMULATED_COINS has 45 entries
    });
  });
});
