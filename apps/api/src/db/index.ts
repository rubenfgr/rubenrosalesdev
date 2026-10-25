import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const createDb = (url: string) => {
  const client = postgres(url, { max: 10 });
  return { db: drizzle(client, { schema }), client };
};
export type Db = ReturnType<typeof createDb>['db'];
