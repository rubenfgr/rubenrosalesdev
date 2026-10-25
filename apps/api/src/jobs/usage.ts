// Muestra el gasto del LLM del mes en curso (solo lectura). Uso en el VPS:
//   docker exec rubenrosales-api node dist/jobs/usage.js
import { createDb } from '../db';
import { loadEnv } from '../env';
import { BudgetGuard, DbUsageStore } from '../services/budget';

const env = loadEnv();
const { db, client } = createDb(env.DATABASE_URL);
const guard = new BudgetGuard({
  provider: env.ASSISTANT_LLM_PROVIDER,
  budgetEur: env.ASSISTANT_LLM_MONTHLY_BUDGET_EUR,
  priceInPerMtok: env.ASSISTANT_LLM_PRICE_IN_PER_MTOK,
  priceOutPerMtok: env.ASSISTANT_LLM_PRICE_OUT_PER_MTOK,
  store: new DbUsageStore(db),
});
await guard.init();
const s = guard.snapshot();
console.log(`${s.month} · ${s.provider}: ${s.costEur.toFixed(4)} € de ${s.budgetEur} € (${((s.costEur / s.budgetEur) * 100).toFixed(1)} %) · ${s.tokensIn} tokens de entrada, ${s.tokensOut} de salida · estado: ${s.state}`);
await client.end();
