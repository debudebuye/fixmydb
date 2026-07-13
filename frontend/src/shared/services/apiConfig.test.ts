import { describe, it, expect, beforeEach } from 'vitest';
import { getAIConfig, setAIConfig, clearAIConfig, getProviderLabel, PROVIDERS } from './apiConfig';

describe('apiConfig', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getAIConfig', () => {
    it('returns null when no config is stored', () => {
      expect(getAIConfig()).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      sessionStorage.setItem('fixmydb_ai_config', 'not-json');
      expect(getAIConfig()).toBeNull();
    });

    it('returns stored config', () => {
      const config = {
        provider: 'openai' as const,
        apiKey: 'sk-test',
        model: 'gpt-4o-mini',
        baseURL: 'https://api.openai.com/v1',
        label: 'OpenAI',
      };
      sessionStorage.setItem('fixmydb_ai_config', JSON.stringify(config));
      expect(getAIConfig()).toEqual(config);
    });
  });

  describe('setAIConfig', () => {
    it('stores config and returns true', () => {
      const config = {
        provider: 'openai' as const,
        apiKey: 'sk-test',
        model: 'gpt-4o-mini',
        baseURL: 'https://api.openai.com/v1',
        label: 'OpenAI',
      };
      expect(setAIConfig(config)).toBe(true);
      expect(getAIConfig()).toEqual(config);
    });
  });

  describe('clearAIConfig', () => {
    it('removes stored config and returns true', () => {
      const config = {
        provider: 'groq' as const,
        apiKey: 'gsk-test',
        model: 'llama3-70b-8192',
        baseURL: 'https://api.groq.com/openai/v1',
        label: 'Groq',
      };
      setAIConfig(config);
      expect(clearAIConfig()).toBe(true);
      expect(getAIConfig()).toBeNull();
    });
  });

  describe('getProviderLabel', () => {
    it('returns label for known provider', () => {
      expect(getProviderLabel('openai')).toBe('OpenAI');
      expect(getProviderLabel('groq')).toBe('Groq');
    });

    it('returns the id itself for unknown provider', () => {
      expect(getProviderLabel('unknown')).toBe('unknown');
    });
  });

  describe('PROVIDERS', () => {
    it('has all required fields for each provider', () => {
      for (const p of PROVIDERS) {
        expect(p.id).toBeTruthy();
        expect(p.label).toBeTruthy();
        expect(p.baseURL).toMatch(/^https?:\/\//);
        expect(p.models.length).toBeGreaterThan(0);
        expect(p.defaultModel).toBeTruthy();
      }
    });
  });
});
