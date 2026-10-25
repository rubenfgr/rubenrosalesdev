import { describe, expect, it } from 'vitest';
import { BudgetGuard, MemoryUsageStore, monthKey } from './budget';
import { FakeLlmClient, type LlmEvent } from './llm';
import { RoutedLlm } from './llm-router';

const mk = (now: () => Date, store = new MemoryUsageStore()) =>
  new BudgetGuard({ provider: 'gemini', budgetEur: 1, priceInPerMtok: 0.3, priceOutPerMtok: 2.5, store, now });
const collect = async (it: AsyncIterable<LlmEvent>) => {
  const out: LlmEvent[] = [];
  for await (const e of it) out.push(e);
  return out;
};
const input = { system: 's', turns: [], maxOutputTokens: 300 };
const reply = (tokensIn: number, tokensOut: number): LlmEvent[] => [{ type: 'text', text: 'ok' }, { type: 'done', usage: { tokensIn, tokensOut } }];

describe('BudgetGuard', () => {
  it('el coste coincide con la cuenta manual: 1 M entrada × 0,30 + 200 k salida × 2,50 = 0,80 €', () => {
    const g = mk(() => new Date('2026-10-10'));
    expect(g.cost({ tokensIn: 1_000_000, tokensOut: 200_000 })).toBeCloseTo(0.8, 10);
  });

  it('pasa de ok a degraded al 80 % y a blocked al 100 %', () => {
    const g = mk(() => new Date('2026-10-10'));
    expect(g.state()).toBe('ok');
    g.record({ tokensIn: 1_000_000, tokensOut: 200_000 }); // 0,80 €
    expect(g.state()).toBe('degraded');
    g.record({ tokensIn: 0, tokensOut: 80_000 }); // +0,20 €
    expect(g.state()).toBe('blocked');
  });

  it('el cambio de mes reinicia el contador', () => {
    let now = new Date('2026-10-31T23:59:00Z');
    const g = mk(() => now);
    g.record({ tokensIn: 0, tokensOut: 1_000_000 }); // 2,50 € > tope
    expect(g.state()).toBe('blocked');
    now = new Date('2026-11-01T00:01:00Z');
    expect(g.state()).toBe('ok');
    expect(g.snapshot()).toMatchObject({ month: '2026-11', costEur: 0 });
  });

  it('persiste y se sincroniza al arrancar', async () => {
    const store = new MemoryUsageStore();
    const now = () => new Date('2026-10-10');
    const a = mk(now, store);
    a.record({ tokensIn: 1_000_000, tokensOut: 200_000 });
    await new Promise((r) => setTimeout(r, 0));
    expect(store.rows.get(`${monthKey(now())}:gemini`)?.costEur).toBeCloseTo(0.8, 6);
    const b = mk(now, store);
    await b.init();
    expect(b.state()).toBe('degraded');
  });
});

describe('RoutedLlm (degradación en cadena)', () => {
  const setup = (withSecondary: boolean) => {
    const g = mk(() => new Date('2026-10-10'));
    const primary = new FakeLlmClient([reply(1_000_000, 200_000), reply(10, 10)]);
    const secondary = new FakeLlmClient([reply(500, 500), reply(500, 500)]);
    return { g, primary, secondary, llm: new RoutedLlm(primary, withSecondary ? secondary : null, g) };
  };

  it('con presupuesto usa el principal y contabiliza el uso', async () => {
    const { llm, primary, g } = setup(true);
    await collect(llm.stream(input));
    expect(primary.calls).toHaveLength(1);
    expect(g.snapshot().costEur).toBeCloseTo(0.8, 6);
  });

  it('al 80 % cambia a Ollama y su uso no cuenta', async () => {
    const { llm, primary, secondary, g } = setup(true);
    await collect(llm.stream(input)); // lleva el gasto a 0,80 €
    await collect(llm.stream(input));
    expect(primary.calls).toHaveLength(1);
    expect(secondary.calls).toHaveLength(1);
    expect(g.snapshot().costEur).toBeCloseTo(0.8, 6);
    expect(llm.available()).toBe(true);
  });

  it('al 80 % sin Ollama no hay LLM (solo reglas)', async () => {
    const { llm, primary } = setup(false);
    await collect(llm.stream(input));
    expect(llm.available()).toBe(false);
    expect(await collect(llm.stream(input))).toEqual([{ type: 'error', reason: 'presupuesto' }]);
    expect(primary.calls).toHaveLength(1);
  });

  it('al 100 % no hay ninguna llamada al principal, aunque haya Ollama', async () => {
    const { llm, primary, secondary, g } = setup(true);
    g.record({ tokensIn: 0, tokensOut: 1_000_000 });
    await collect(llm.stream(input));
    expect(primary.calls).toHaveLength(0);
    expect(secondary.calls).toHaveLength(1);
  });
});
