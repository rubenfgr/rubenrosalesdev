import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SearchItem } from '../../lib/blog-search';
import './BlogBrowser.css';

interface Labels {
  search: string; searchPlaceholder: string; clearSearch: string; filterTags: string; clearFilters: string;
  resultsOne: string; resultsMany: string; noResults: string; noResultsHint: string; searchLoading: string; searchError: string;
  pageN: string; readingTime: string; tagsAria: string; pagination: string; newer: string; older: string;
}
interface Props {
  tags: [string, number][];
  perPage: number;
  indexUrl: string;
  tagBase: string;
  staticId: string;
  labels: Labels;
}

const MAX_QUERY = 100;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

interface Entry { item: SearchItem; title: string; head: string; body: string; pos: number }
interface Hit { item: SearchItem; score: number; pos: number }

/** Todas las palabras de la consulta deben aparecer (título pesa más que descripción/etiquetas y que el texto); todas las etiquetas elegidas deben estar. */
function run(entries: Entry[], terms: string[], tags: string[]): Hit[] {
  const hits: Hit[] = [];
  for (const e of entries) {
    if (!tags.every((t) => e.item.g.includes(t))) continue;
    let score = 0;
    let ok = true;
    for (const w of terms) {
      if (e.title.includes(w)) score += 5;
      else if (e.head.includes(w)) score += 3;
      else if (e.body.includes(w)) score += 1;
      else { ok = false; break; }
    }
    if (ok) hits.push({ item: e.item, score, pos: e.pos });
  }
  return hits.sort((a, b) => b.score - a.score || a.pos - b.pos);
}

export default function BlogBrowser({ tags, perPage, indexUrl, tagBase, staticId, labels: L }: Props) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const results = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const terms = norm(q).split(/\s+/).filter(Boolean);
  const active = terms.length > 0 || sel.length > 0;

  const ensure = () => {
    if (items || status === 'loading') return;
    setStatus('loading');
    fetch(indexUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: SearchItem[]) => { setItems(d); setStatus('idle'); })
      .catch(() => setStatus('error'));
  };

  // Estado inicial desde la URL (?q=…&tag=a&tag=b&p=2) para poder compartir una búsqueda.
  useEffect(() => {
    const u = new URLSearchParams(location.search);
    const q0 = (u.get('q') ?? '').slice(0, MAX_QUERY);
    const known = new Set(tags.map(([t]) => t));
    const t0 = u.getAll('tag').filter((t) => known.has(t));
    if (q0 || t0.length) { setQ(q0); setSel(t0); setPage(Math.max(1, Number(u.get('p')) || 1)); ensure(); }
  }, []);

  // La lista estática (con su paginación por páginas reales) solo se muestra cuando no hay filtros.
  useEffect(() => {
    const el = document.getElementById(staticId);
    if (el) el.hidden = active;
    if (active) ensure();
  }, [active]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const u = new URLSearchParams();
    if (q.trim()) u.set('q', q.trim());
    sel.forEach((t) => u.append('tag', t));
    if (page > 1) u.set('p', String(page));
    const qs = u.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  }, [q, sel, page]);

  const entries = useMemo<Entry[]>(
    () => (items ?? []).map((item, pos) => ({ item, pos, title: norm(item.t), head: norm(`${item.t} ${item.s} ${item.g.join(' ')}`), body: norm(item.x) })),
    [items],
  );
  const hits = useMemo(() => (items ? run(entries, terms, sel) : []), [entries, q, sel]);
  // Cuántos artículos quedarían al añadir cada etiqueta (con la búsqueda y las demás etiquetas actuales).
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const [t, n] of tags) m.set(t, items ? (sel.includes(t) ? run(entries, terms, sel).length : run(entries, terms, [...sel, t]).length) : n);
    return m;
  }, [entries, q, sel, items]);

  const totalPages = Math.max(1, Math.ceil(hits.length / perPage));
  const cur = Math.min(page, totalPages);
  const shown = hits.slice((cur - 1) * perPage, cur * perPage);

  const toggle = (t: string) => { setSel((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t])); setPage(1); };
  const clearAll = () => { setQ(''); setSel([]); setPage(1); };
  const goTo = (n: number) => { setPage(n); results.current?.scrollIntoView({ block: 'start' }); };
  const count = (n: number) => (n === 1 ? L.resultsOne : L.resultsMany).replace('{n}', String(n));

  return (
    <div class="bb">
      <form class="bb-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label for="bb-q">{L.search}</label>
        <div class="bb-field">
          <input
            id="bb-q" type="search" value={q} maxLength={MAX_QUERY} placeholder={L.searchPlaceholder} autocomplete="off" enterkeyhint="search" spellcheck={false}
            onInput={(e) => { setQ((e.currentTarget as HTMLInputElement).value); setPage(1); }}
            onKeyDown={(e) => { if (e.key === 'Escape' && q) { e.preventDefault(); setQ(''); } }}
          />
          {q && <button type="button" class="bb-x" aria-label={L.clearSearch} onClick={() => { setQ(''); setPage(1); (document.getElementById('bb-q') as HTMLInputElement | null)?.focus(); }}>×</button>}
        </div>
      </form>

      <div class="bb-tags" role="group" aria-labelledby="bb-tags-l">
        <span id="bb-tags-l" class="bb-label">{L.filterTags}</span>
        <div class="bb-chips">
          {tags.map(([t]) => {
            const on = sel.includes(t);
            const n = counts.get(t) ?? 0;
            return (
              <button type="button" class={`bb-chip${on ? ' on' : ''}`} aria-pressed={on} disabled={!on && n === 0} onClick={() => toggle(t)}>
                <span>#{t}</span> <small>{n}</small>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <div ref={results} class="bb-results">
          <div class="bb-status" role="status" aria-live="polite">
            <span>{status === 'loading' ? L.searchLoading : status === 'error' ? L.searchError : count(hits.length)}</span>
            <button type="button" class="bb-clear" onClick={clearAll}>{L.clearFilters}</button>
          </div>
          {status === 'idle' && items && hits.length === 0 && (
            <div class="bb-empty"><b>{L.noResults}</b><p>{L.noResultsHint}</p></div>
          )}
          {shown.length > 0 && (
            <div class="bb-list">
              {shown.map(({ item }) => (
                <article class="bb-card">
                  <p class="bb-meta"><time>{item.df}</time><span aria-hidden="true">·</span><span>{L.readingTime.replace('{minutes}', String(item.m))}</span></p>
                  <h2><a href={item.u}>{item.t}</a></h2>
                  <p class="bb-desc">{item.s}</p>
                  <ul class="bb-card-tags" aria-label={L.tagsAria}>{item.g.map((t) => <li><a href={`${tagBase}${t}`}>{t}</a></li>)}</ul>
                </article>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav class="bb-pages" aria-label={L.pagination}>
              {cur > 1 ? <button type="button" onClick={() => goTo(cur - 1)}>{L.newer}</button> : <span aria-hidden="true" />}
              <ul>{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => <li><button type="button" aria-current={n === cur ? 'page' : undefined} aria-label={L.pageN.replace('{n}', String(n))} onClick={() => goTo(n)}>{n}</button></li>)}</ul>
              {cur < totalPages ? <button type="button" onClick={() => goTo(cur + 1)}>{L.older}</button> : <span aria-hidden="true" />}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
