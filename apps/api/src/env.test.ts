import { describe, expect, it } from 'vitest';
import { loadEnv } from './env';

const base = { NODE_ENV: 'test', DATABASE_URL: 'postgres://t' };

describe('loadEnv', () => {
  it('sin IP_HASH_SALT genera una sal aleatoria distinta en cada arranque', () => {
    const a = loadEnv(base).IP_HASH_SALT;
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(loadEnv(base).IP_HASH_SALT).not.toBe(a);
  });
  it('respeta una sal definida', () => {
    expect(loadEnv({ ...base, IP_HASH_SALT: 'fija' }).IP_HASH_SALT).toBe('fija');
  });
});
