import { describe, expect, it, vi } from 'vitest';
import { loadEnv } from '../env';
import { BudgetGuard, MemoryUsageStore } from './budget';
import { createLlmClient } from './llm-factory';

const budget = () => new BudgetGuard({ provider: 'gemini', budgetEur: 1, priceInPerMtok: 0.3, priceOutPerMtok: 2.5, store: new MemoryUsageStore() });
const env = (extra: Record<string, string>) => loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://t', ...extra });
const gem = { ASSISTANT_LLM_ENABLED: '1', ASSISTANT_LLM_API_KEY: 'k', ASSISTANT_LLM_MODEL: 'm' };

describe('createLlmClient', () => {
  it('kill switch: sin ASSISTANT_LLM_ENABLED=1 no hay LLM', () => {
    expect(createLlmClient(env({ ...gem, ASSISTANT_LLM_ENABLED: '0', ASSISTANT_LLM_PRICE_IN_PER_MTOK: '0.3', ASSISTANT_LLM_PRICE_OUT_PER_MTOK: '2.5' }), budget())).toBeNull();
  });
  it('Gemini sin precios configurados queda desactivado (el tope no podría calcularse)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(createLlmClient(env(gem), budget())).toBeNull();
    spy.mockRestore();
  });
  it('Gemini con clave, modelo y precios se activa', () => {
    expect(createLlmClient(env({ ...gem, ASSISTANT_LLM_PRICE_IN_PER_MTOK: '0.3', ASSISTANT_LLM_PRICE_OUT_PER_MTOK: '2.5' }), budget())).not.toBeNull();
  });
  it('Ollama necesita modelo y no necesita precios', () => {
    expect(createLlmClient(env({ ASSISTANT_LLM_ENABLED: '1', ASSISTANT_LLM_PROVIDER: 'ollama' }), budget())).toBeNull();
    expect(createLlmClient(env({ ASSISTANT_LLM_ENABLED: '1', ASSISTANT_LLM_PROVIDER: 'ollama', OLLAMA_MODEL: 'x' }), budget())).not.toBeNull();
  });
});
