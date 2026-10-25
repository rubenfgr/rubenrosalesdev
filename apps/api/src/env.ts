import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  /** Origen permitido para CORS (la web). Vacío = misma origen, sin CORS. */
  ALLOWED_ORIGIN: z.string().default(''),
  /** Sal para hashear las IPs si hay que guardarlas (nunca en claro). */
  IP_HASH_SALT: z.string().default(''),
  RATE_LIMIT_CHAT_PER_MIN: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_LEADS_PER_HOUR: z.coerce.number().int().positive().default(5),
  /** Email de los leads por Gmail API (OAuth2). Vacío = sin envío. */
  CONTACT_TO: z.string().default(''),
  GMAIL_SENDER: z.string().default(''),
  GMAIL_CLIENT_ID: z.string().default(''),
  GMAIL_CLIENT_SECRET: z.string().default(''),
  GMAIL_REFRESH_TOKEN: z.string().default(''),
  /** Conservación (D-3): conversaciones 90 días, leads 12 meses. */
  CONVERSATION_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
  LEAD_RETENTION_DAYS: z.coerce.number().int().positive().default(365),
  /** Asistente con LLM. Apagado salvo `ASSISTANT_LLM_ENABLED=1` (kill switch). */
  ASSISTANT_LLM_ENABLED: z.string().default(''),
  ASSISTANT_LLM_PROVIDER: z.enum(['gemini', 'ollama']).default('gemini'),
  ASSISTANT_LLM_API_KEY: z.string().default(''),
  ASSISTANT_LLM_MODEL: z.string().default(''),
  ASSISTANT_LLM_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(300),
  ASSISTANT_LLM_MONTHLY_BUDGET_EUR: z.coerce.number().positive().default(1),
  /** Euros por millón de tokens (copiados de la tabla oficial de precios). */
  ASSISTANT_LLM_PRICE_IN_PER_MTOK: z.coerce.number().nonnegative().default(0),
  ASSISTANT_LLM_PRICE_OUT_PER_MTOK: z.coerce.number().nonnegative().default(0),
  OLLAMA_BASE_URL: z.string().default('http://ollama:11434'),
  OLLAMA_MODEL: z.string().default(''),
});

export type Env = z.infer<typeof schema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => schema.parse(source);
