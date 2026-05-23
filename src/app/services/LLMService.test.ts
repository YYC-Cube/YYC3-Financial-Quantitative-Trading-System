import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  getProvider,
  getProviderConfigs,
  hasApiKey,
  getApiKey,
  setApiKey,
  detectOllama,
  testModelConnectivity,
  sendChat,
  type ProviderId,
  type ChatRequest,
} from '@/app/services/LLMService';

describe('LLMService', () => {
  describe('Provider configs', () => {
    it('should have 4 providers', () => {
      const configs = getProviderConfigs();
      expect(configs).toHaveLength(4);
      const ids = configs.map(c => c.id);
      expect(ids).toContain('ollama');
      expect(ids).toContain('zhipu');
      expect(ids).toContain('openai');
      expect(ids).toContain('anthropic');
    });

    it('should get provider by id', () => {
      const ollama = getProvider('ollama');
      expect(ollama).toBeDefined();
      expect(ollama!.name).toBe('Ollama (本地)');
      expect(ollama!.authType).toBe('none');
      expect(ollama!.baseUrl).toBe('http://localhost:11434');
    });

    it('should return undefined for unknown provider', () => {
      expect(getProvider('unknown' as ProviderId)).toBeUndefined();
    });

    it('ollama should have models', () => {
      const ollama = getProvider('ollama');
      expect(ollama!.models.length).toBeGreaterThan(0);
      const modelIds = ollama!.models.map(m => m.id);
      expect(modelIds.some(id => id.includes('qwen'))).toBe(true);
    });

    it('zhipu should have GLM models', () => {
      const zhipu = getProvider('zhipu');
      expect(zhipu).toBeDefined();
      expect(zhipu!.models.some(m => m.id.includes('glm'))).toBe(true);
    });

    it('openai should have GPT models', () => {
      const openai = getProvider('openai');
      expect(openai).toBeDefined();
      expect(openai!.models.some(m => m.id.includes('gpt'))).toBe(true);
    });

    it('anthropic should have Claude models', () => {
      const anthropic = getProvider('anthropic');
      expect(anthropic).toBeDefined();
      expect(anthropic!.models.some(m => m.id.includes('claude'))).toBe(true);
    });
  });

  describe('API key management', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('ollama should always have key (authType none)', () => {
      expect(hasApiKey('ollama')).toBe(true);
    });

    it('should check key for auth-required providers', () => {
      const hasOpenAIKey = hasApiKey('openai');
      expect(typeof hasOpenAIKey).toBe('boolean');
    });

    it('should set and get API key', () => {
      setApiKey('openai', 'sk-test-key-12345');
      expect(getApiKey('openai')).toBe('sk-test-key-12345');
      expect(hasApiKey('openai')).toBe(true);
    });

    it('should remove API key when setting empty string', () => {
      setApiKey('zhipu', 'test-key');
      expect(hasApiKey('zhipu')).toBe(true);

      setApiKey('zhipu', '');
      expect(getApiKey('zhipu')).toBe('');
      expect(hasApiKey('zhipu')).toBe(false);
    });

    it('should handle different provider keys independently', () => {
      setApiKey('openai', 'openai-key');
      setApiKey('zhipu', 'zhipu-key');

      expect(getApiKey('openai')).toBe('openai-key');
      expect(getApiKey('zhipu')).toBe('zhipu-key');
      expect(getApiKey('anthropic')).toBe('');
    });

    it('should return empty string when no storage available', () => {
      const storageSpy = vi.spyOn(window, 'localStorage', 'get').mockReturnValue(undefined as any);
      
      // This should not throw and return empty string
      const result = getApiKey('openai');
      expect(result).toBe('');

      storageSpy.mockRestore();
    });
  });

  describe('detectOllama', () => {
    it('should return true when Ollama is running', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await detectOllama();
      expect(result).toBe(true);
    });

    it('should return false when Ollama is not running', async () => {
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await detectOllama();
      expect(result).toBe(false);
    });

    it('should return false on timeout', async () => {
      globalThis.fetch = vi.fn().mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100)
        )
      );

      const result = await detectOllama();
      expect(result).toBe(false);
    });
  });

  describe('testModelConnectivity', () => {
    it('should return error for unknown provider', async () => {
      const result = await testModelConnectivity('unknown' as ProviderId, 'model-id');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Provider not found');
    });

    it('should return error when API key missing for auth-required provider', async () => {
      localStorage.clear(); // Ensure no keys
      
      const result = await testModelConnectivity('openai', 'gpt-4o');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('API key not configured');
    });

    it('should succeed for ollama without API key', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{}'),
      } as Response);

      const result = await testModelConnectivity('ollama', 'qwen2.5:7b');
      expect(result.ok).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeNull();
    });

    it('should handle HTTP errors for ollama', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response);

      const result = await testModelConnectivity('ollama', 'invalid-model');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('HTTP 500');
    });

    it('should handle network errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network unreachable'));

      const result = await testModelConnectivity('ollama', 'qwen2.5:7b');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network unreachable');
    });

    it('should handle timeout errors', async () => {
      globalThis.fetch = vi.fn().mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 10)
        )
      );

      const result = await testModelConnectivity('ollama', 'qwen2.5:7b');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('timed out');
    });

    it('should work with bearer token authentication (openai)', async () => {
      setApiKey('openai', 'sk-test-openai');
      
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{}'),
      } as Response);

      const result = await testModelConnectivity('openai', 'gpt-4o');
      expect(result.ok).toBe(true);
    });

    it('should work with x-api-key authentication (anthropic)', async () => {
      setApiKey('anthropic', 'sk-ant-test');
      
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{}'),
      } as Response);

      const result = await testModelConnectivity('anthropic', 'claude-sonnet-4-20250514');
      expect(result.ok).toBe(true);
    });
  });

  describe('sendChat', () => {
    it('should throw error for unknown provider', async () => {
      const request: ChatRequest = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(sendChat(request, 'unknown' as ProviderId)).rejects.toThrow('Provider unknown not found');
    });

    it('should throw error when API key missing for openai', async () => {
      localStorage.clear();

      const request: ChatRequest = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(sendChat(request, 'openai')).rejects.toThrow();
    });

    it('should send chat to ollama successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: { content: 'Response from Ollama' },
          model: 'qwen2.5:7b',
        }),
      } as Response);

      const request: ChatRequest = {
        model: 'qwen2.5:7b',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const response = await sendChat(request, 'ollama');
      expect(response.content).toBe('Response from Ollama');
      expect(response.model).toBe('qwen2.5:7b');
      expect(response.providerId).toBe('ollama');
      expect(response.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should include usage information when available', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'AI Response' } }],
          model: 'gpt-4o',
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        }),
      } as Response);

      setApiKey('openai', 'sk-test');

      const request: ChatRequest = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Test' }],
      };

      const response = await sendChat(request, 'openai');
      expect(response.usage).toBeDefined();
      expect(response.usage?.totalTokens).toBe(30);
    });

    it('should handle chat errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const request: ChatRequest = {
        model: 'qwen2.5:7b',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(sendChat(request, 'ollama')).rejects.toThrow('Network error');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in API keys', () => {
      setApiKey('openai', 'sk-test-!@#$%^&*()_+-=[]{}|;:\'",.<>?/');
      expect(getApiKey('openai')).toContain('sk-test-');
    });

    it('should handle very long API keys', () => {
      const longKey = 'a'.repeat(1000);
      setApiKey('zhipu', longKey);
      expect(getApiKey('zhipu')).toHaveLength(1000);
    });

    it('should handle empty messages array in chat request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: { content: '' },
          model: 'qwen2.5:7b',
        }),
      } as Response);

      const request: ChatRequest = {
        model: 'qwen2.5:7b',
        messages: [],
      };

      const response = await sendChat(request, 'ollama');
      expect(response).toBeDefined();
    });

    it('should handle system role in messages', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: { content: 'System understood' },
          model: 'qwen2.5:7b',
        }),
      } as Response);

      const request: ChatRequest = {
        model: 'qwen2.5:7b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
        ],
      };

      const response = await sendChat(request, 'ollama');
      expect(response.content).toBe('System understood');
    });
  });
});
