import type { Repositories } from '../db/repositories';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Borra lo caducado al arrancar y después una vez al día. Registra solo recuentos. */
export function startPurgeJob(repos: Repositories, intervalMs = DAY_MS) {
  const run = async () => {
    try {
      const { conversations, leads } = await repos.deleteExpired();
      console.log(JSON.stringify({ job: 'purge', conversations, leads }));
    } catch {
      console.error('purge: fallo al borrar lo caducado');
    }
  };
  void run();
  const timer = setInterval(run, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
