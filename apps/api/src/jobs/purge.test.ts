import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRepositories } from '../db/repositories';
import { startPurgeJob } from './purge';

afterEach(() => vi.useRealTimers());

describe('purge', () => {
  it('borra al arrancar y cada intervalo, registrando solo recuentos', async () => {
    vi.useFakeTimers();
    const repos = new MemoryRepositories();
    const spy = vi.spyOn(repos, 'deleteExpired').mockResolvedValue({ conversations: 2, leads: 1 });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const stop = startPurgeJob(repos, 1000);
    await vi.advanceTimersByTimeAsync(2500);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(log).toHaveBeenCalledWith('{"job":"purge","conversations":2,"leads":1}');
    stop();
    log.mockRestore();
  });
});
