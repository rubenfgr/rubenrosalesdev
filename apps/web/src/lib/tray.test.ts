import { describe, expect, it } from 'vitest';
import { buildLog, classify, stateOf, tally, type TrayItem } from './tray';

const mk = (id: string, confidence: number): TrayItem => ({ id, confidence, title: id, done: `hecho ${id}`, why: `motivo ${id}` });
// Mismas claridades que content/trayItems: 97, 95, 38, 68, 99, 81
const items = [mk('a', 97), mk('b', 95), mk('c', 38), mk('d', 68), mk('e', 99), mk('f', 81)];
const MODES = { reviewAll: 101, doubtful: 85, automatic: 50 };

describe('stateOf', () => {
  it('pasa solo cuando la claridad alcanza el umbral', () => {
    expect(stateOf(mk('x', 85), 85)).toBe('auto');
    expect(stateOf(mk('x', 84), 85)).toBe('review');
  });
  it('lo ya decidido por la persona no cambia con el modo', () => {
    expect(stateOf(mk('x', 10), 50, 'approved')).toBe('approved');
    expect(stateOf(mk('x', 99), 101, 'corrected')).toBe('corrected');
  });
});

describe('classify + tally', () => {
  it('«Revisar todo»: nada pasa solo', () => {
    expect(tally(classify(items, MODES.reviewAll))).toEqual({ auto: 0, review: 6 });
  });
  it('«Solo lo dudoso»: pasan los claros (≥ 85)', () => {
    const rows = classify(items, MODES.doubtful);
    expect(tally(rows)).toEqual({ auto: 3, review: 3 });
    expect(rows.filter((r) => r.state === 'review').map((r) => r.item.id)).toEqual(['c', 'd', 'f']);
  });
  it('«Automático»: solo espera lo que no tiene regla (< 50)', () => {
    const rows = classify(items, MODES.automatic);
    expect(tally(rows)).toEqual({ auto: 5, review: 1 });
    expect(rows.find((r) => r.state === 'review')?.item.id).toBe('c');
  });
  it('cada modo da un resultado distinto sobre el mismo ejemplo', () => {
    const counts = Object.values(MODES).map((t) => tally(classify(items, t)).auto);
    expect(new Set(counts).size).toBe(3);
  });
  it('lo resuelto cuenta como decidido, no como pendiente', () => {
    const rows = classify(items, MODES.doubtful, { c: 'corrected' });
    expect(tally(rows)).toEqual({ auto: 3, review: 2 });
  });
});

describe('buildLog', () => {
  const text = { selfHandled: 'Lo gestionas tú', selfHandledWhy: '{title}. Tomo nota.' };
  const seed = [{ id: 's', time: '9:02', action: 'previo', why: 'x', who: 'auto' as const }];
  it('solo registra lo que ya ha pasado, lo más reciente arriba, y deja la semilla debajo', () => {
    const log = buildLog(classify(items, MODES.doubtful), seed, text);
    expect(log.map((e) => e.id)).toEqual(['l-e', 'l-b', 'l-a', 's']);
  });
  it('lo corregido a mano se registra con su texto y autor', () => {
    const log = buildLog(classify(items, MODES.doubtful, { c: 'corrected' }), [], text);
    const e = log.find((x) => x.id === 'l-c')!;
    expect(e).toMatchObject({ who: 'corrected', action: 'Lo gestionas tú', why: 'c. Tomo nota.' });
  });
});
