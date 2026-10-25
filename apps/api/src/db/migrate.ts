// Aplica las migraciones SQL de ./drizzle. Se ejecuta antes de arrancar la API (ver Dockerfile y compose).
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadEnv } from '../env';

const env = loadEnv();
const client = postgres(env.DATABASE_URL, { max: 1 });
await migrate(drizzle(client), { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname });
await client.end();
console.log('migraciones aplicadas');
