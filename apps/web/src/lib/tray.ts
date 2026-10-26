// Lógica pura de «02 / control»: qué pasa solo y qué espera revisión según el umbral del modo.
export type Resolution = 'approved' | 'corrected';
export type TrayState = 'auto' | 'review' | Resolution;
export interface TrayItem { id: string; confidence: number; title: string; done: string; why: string }
export interface TrayEntry { id: string; time: string; action: string; why: string; who: 'auto' | 'approved' | 'corrected' }
export interface TrayRow<T extends TrayItem> { item: T; state: TrayState }

/** Un elemento pasa solo si su claridad alcanza el umbral del modo; lo ya decidido por la persona no cambia. */
export const stateOf = (item: TrayItem, threshold: number, resolved?: Resolution): TrayState =>
  resolved ?? (item.confidence >= threshold ? 'auto' : 'review');

export const classify = <T extends TrayItem>(items: T[], threshold: number, resolved: Record<string, Resolution> = {}): TrayRow<T>[] =>
  items.map((item) => ({ item, state: stateOf(item, threshold, resolved[item.id]) }));

export const tally = (rows: TrayRow<TrayItem>[]) => ({
  auto: rows.filter((r) => r.state === 'auto').length,
  review: rows.filter((r) => r.state === 'review').length,
});

const clock = (i: number) => `9:${String(12 + i * 3).padStart(2, '0')}`;

/** Registro derivado del estado actual: lo que espera revisión aún no ha pasado; lo anterior (semilla) queda debajo. */
export const buildLog = <T extends TrayItem>(rows: TrayRow<T>[], seed: TrayEntry[], text: { selfHandled: string; selfHandledWhy: string }): TrayEntry[] => {
  const entries: TrayEntry[] = [];
  rows.forEach(({ item, state }, i) => {
    if (state === 'review') return;
    entries.unshift(
      state === 'corrected'
        ? { id: `l-${item.id}`, time: clock(i), action: text.selfHandled, why: text.selfHandledWhy.replace('{title}', item.title), who: 'corrected' }
        : { id: `l-${item.id}`, time: clock(i), action: item.done, why: item.why, who: state },
    );
  });
  return [...entries, ...seed];
};
