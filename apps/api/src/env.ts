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
});

export type Env = z.infer<typeof schema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => schema.parse(source);
