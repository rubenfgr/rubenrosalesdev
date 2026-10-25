import { createHash } from 'node:crypto';

/** Hash con sal de una IP: la IP en claro nunca se guarda. */
export const hashIp = (ip: string, salt: string): string => createHash('sha256').update(`${salt}:${ip}`).digest('hex');

/** Contador por clave y día (UTC) en memoria. `take()` devuelve false cuando se agota el cupo. */
export function dailyCounter(limit: number, now: () => Date = () => new Date()) {
  let day = '';
  const counts = new Map<string, number>();
  return {
    take(key: string): boolean {
      const today = now().toISOString().slice(0, 10);
      if (today !== day) {
        day = today;
        counts.clear();
      }
      const n = counts.get(key) ?? 0;
      if (n >= limit) return false;
      counts.set(key, n + 1);
      return true;
    },
  };
}
