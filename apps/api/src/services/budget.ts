// Tope de gasto mensual del LLM (T-7.3). Contador en memoria sincronizado con la base de datos al arrancar.
import { and, eq } from 'drizzle-orm';
import type { Db } from '../db';
import { llmUsageMonthly } from '../db/schema';
import type { LlmUsage } from './llm';

export interface Totals {
  tokensIn: number;
  tokensOut: number;
  costEur: number;
}

export interface UsageStore {
  load(month: string, provider: string): Promise<Totals | null>;
  save(month: string, provider: string, totals: Totals): Promise<void>;
}

export class MemoryUsageStore implements UsageStore {
  rows = new Map<string, Totals>();
  async load(month: string, provider: string) {
    return this.rows.get(`${month}:${provider}`) ?? null;
  }
  async save(month: string, provider: string, totals: Totals) {
    this.rows.set(`${month}:${provider}`, { ...totals });
  }
}

export class DbUsageStore implements UsageStore {
  constructor(private db: Db) {}
  async load(month: string, provider: string) {
    const [row] = await this.db
      .select()
      .from(llmUsageMonthly)
      .where(and(eq(llmUsageMonthly.month, month), eq(llmUsageMonthly.provider, provider)));
    return row ? { tokensIn: row.tokensIn, tokensOut: row.tokensOut, costEur: row.costEur } : null;
  }
  async save(month: string, provider: string, t: Totals) {
    await this.db
      .insert(llmUsageMonthly)
      .values({ month, provider, ...t })
      .onConflictDoUpdate({ target: [llmUsageMonthly.month, llmUsageMonthly.provider], set: t });
  }
}

export type BudgetState = 'ok' | 'degraded' | 'blocked';

export interface BudgetOptions {
  provider: string;
  budgetEur: number;
  /** Euros por millón de tokens de entrada / salida (de la tabla oficial de precios). */
  priceInPerMtok: number;
  priceOutPerMtok: number;
  /** Fracción del tope a partir de la cual se degrada (0,8). */
  degradeAt?: number;
  store: UsageStore;
  now?: () => Date;
}

export const monthKey = (d: Date): string => d.toISOString().slice(0, 7);

export class BudgetGuard {
  private month: string;
  private totals: Totals = { tokensIn: 0, tokensOut: 0, costEur: 0 };
  private now: () => Date;
  private degradeAt: number;

  constructor(private opts: BudgetOptions) {
    this.now = opts.now ?? (() => new Date());
    this.degradeAt = opts.degradeAt ?? 0.8;
    this.month = monthKey(this.now());
  }

  /** Carga el gasto del mes en curso (llamar al arrancar). */
  async init() {
    this.totals = (await this.opts.store.load(this.month, this.opts.provider)) ?? { tokensIn: 0, tokensOut: 0, costEur: 0 };
  }

  /** El mes se reinicia solo: si cambia la clave `YYYY-MM`, el contador vuelve a cero. */
  private roll() {
    const m = monthKey(this.now());
    if (m !== this.month) {
      this.month = m;
      this.totals = { tokensIn: 0, tokensOut: 0, costEur: 0 };
    }
  }

  cost(u: LlmUsage): number {
    return (u.tokensIn * this.opts.priceInPerMtok + u.tokensOut * this.opts.priceOutPerMtok) / 1_000_000;
  }

  state(): BudgetState {
    this.roll();
    const used = this.totals.costEur;
    if (used >= this.opts.budgetEur) return 'blocked';
    if (used >= this.opts.budgetEur * this.degradeAt) return 'degraded';
    return 'ok';
  }

  record(u: LlmUsage) {
    this.roll();
    this.totals = {
      tokensIn: this.totals.tokensIn + u.tokensIn,
      tokensOut: this.totals.tokensOut + u.tokensOut,
      costEur: this.totals.costEur + this.cost(u),
    };
    void this.opts.store.save(this.month, this.opts.provider, this.totals).catch(() => console.error('budget: no se pudo guardar el gasto'));
  }

  snapshot() {
    this.roll();
    return { month: this.month, provider: this.opts.provider, ...this.totals, budgetEur: this.opts.budgetEur, state: this.state() };
  }
}
