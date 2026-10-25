import { Hono } from 'hono';
import type { Deps } from '../app';

export const healthRoutes = ({ pingDb }: Deps) =>
  new Hono().get('/', async (c) => {
    try {
      await pingDb();
      return c.json({ status: 'ok' });
    } catch {
      return c.json({ status: 'degraded' }, 503);
    }
  });
