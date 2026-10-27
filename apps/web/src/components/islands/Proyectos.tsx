import { useEffect, useRef, useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './Proyectos.css';

type Status = 'in-development' | 'maintenance' | 'done';
type Category = 'ai-automation' | 'web' | 'app' | 'sensors';
interface Project { id: string; featured: boolean; category: Category; type: string; status: Status; year: number; title: string; summary: string; includes: string[] }
type Mock = any; // subárbol de ui.projects.mock (cadenas ya traducidas)
interface Props {
  projects: Project[];
  locale: string;
  contactHref: string;
  labels: {
    eyebrow: string; title1: string; title2: string; lead: string; previous: string; next: string; goTo: string; privateBadge: string; illustrative: string;
    moreTitle: string; scrollPrev: string; scrollNext: string; privateTitle: string; privateText: string; askTitle: string; askCta: string;
    filters: Record<'all' | 'web' | 'app' | 'sensors', string>; status: Record<Status, string>; counter: string; mock: Mock;
  };
}

const cap = (n: number, len: number) => ((n % len) + len) % len;

function OrdersMock({ M, t, locale }: { M: Mock; t: number; locale: string }) {
  const k = Math.floor(t / 5), ph = t % 5;
  const custs = Object.values(M.customers) as string[];
  const lines = [6, 14, 3, 9, 22, 5, 11, 4];
  const rows = [0, 1, 2, 3, 4].map((i) => {
    const idx = k + 4 - i;
    const via = idx % 3 === 1 ? M.viaPdf : M.viaEmail;
    const state = i === 0 ? (ph < 2 ? 'reading' : ph < 4 ? 'checking' : 'created') : 'created';
    return { n: `#${4471 + idx}`, c: custs[idx % custs.length]!, d: `${M.lines.replace('{n}', String(lines[idx % lines.length]))} · ${via}`, state, hot: i === 0 && ph < 2 };
  });
  const rec = 24 + k, inProc = ph < 4 ? 1 : 0;
  void locale;
  return (
    <div class="mock">
      <div class="mock-top"><b>{M.title}</b><small class="live">{M.live}</small></div>
      <div class="mock-kpis">
        <div><span>{M.received}</span><b>{rec}</b></div>
        <div><span>{M.auto}</span><b style="color:var(--color-secondary)">{rec - inProc}</b></div>
        <div><span>{M.inProgress}</span><b style="color:var(--color-primary)">{inProc}</b></div>
      </div>
      {rows.map((r) => (
        <div class={`mock-row${r.hot ? ' hot' : ''}`}>
          <span style="min-width:0"><span class="name"><strong>{r.n}</strong> · {r.c}</span><span class="sub">{r.d}</span></span>
          <span class={`pill${r.state === 'created' ? ' ok' : r.state === 'checking' ? ' warn' : ''}`}>{M.states[r.state]}</span>
        </div>
      ))}
    </div>
  );
}

function SurveysMock({ M, t }: { M: Mock; t: number }) {
  const houses = Object.values(M.houses) as { name: string; text: string }[];
  const scores = [9, 10, 6, 8, 9, 4];
  const k = t;
  const P = 62 + Math.floor(k / 2), N = 14 + Math.floor(k / 5), D = 9 + Math.floor(k / 7), tot = P + N + D;
  const rows = [0, 1, 2, 3].map((i) => {
    const j = cap(k - i, 6);
    return { ...houses[j]!, score: scores[j]!, hot: i === 0 };
  });
  return (
    <div class="mock">
      <div style="padding:12px 16px;border-bottom:1px solid var(--color-border)">
        <div class="mock-top" style="padding:0;border:0"><b>{M.title}</b><small>{M.responses.replace('{n}', String(tot))}</small></div>
        <div class="stack">
          <i style={`width:${(P / tot) * 100}%;background:var(--color-secondary)`} />
          <i style={`width:${(N / tot) * 100}%;background:var(--color-border-strong)`} />
          <i style={`width:${(D / tot) * 100}%;background:#c98a72`} />
        </div>
        <div class="legend"><span>{M.yes} · <strong>{P}</strong></span><span>{M.neutral} · <strong>{N}</strong></span><span>{M.no} · <strong>{D}</strong></span></div>
      </div>
      {rows.map((r) => (
        <div class={`mock-row${r.hot ? ' hot' : ''}`} style="grid-template-columns:36px minmax(0,1fr)">
          <span class={`score${r.score <= 6 ? ' lo' : r.score >= 9 ? ' hi' : ''}`}>{r.score}</span>
          <span style="min-width:0"><span class="name">{r.name}</span><span class="sub">«{r.text}»</span></span>
        </div>
      ))}
      <div class="mock-row"><span class="sub" style="margin:0">{M.sentToday}</span><b>{14 + k}</b></div>
    </div>
  );
}

function CountMock({ M, t }: { M: Mock; t: number }) {
  const items = Object.values(M.items) as string[];
  const codes = ['8 412345 001023', '8 412345 002518', '8 412345 118027', '8 412345 120075', '8 412345 122109'];
  const qty = [120, 200, 76, 36, 48];
  const cyc = t % 12;
  const online = cyc < 4 || cyc >= 8;
  const sc = Math.min(5, 1 + Math.floor(cyc / 2));
  const synced = cyc >= 8 ? Math.min(5, (cyc - 7) * 2) : 0;
  const allSynced = synced >= sc && cyc >= 8;
  const msg = !online ? M.offlineMsg : allSynced ? M.syncedMsg : M.syncingMsg;
  return (
    <div class="mock">
      <div class="mock-top"><b>{M.title}</b><span class={`pill ${online ? 'ok' : 'warn'}`}>{online ? M.online : M.offline}</span></div>
      {items.map((n, i) => {
        const has = i < sc, sy = i < synced;
        return (
          <div class="mock-row" style={`opacity:${has ? 1 : 0.35}`}>
            <span style="min-width:0"><span class="name">{n}</span><span class="sub">{codes[i]}</span></span>
            <span style="display:flex;align-items:center;gap:8px"><b>{qty[i]}</b>{has && <span class={`pill${sy ? ' ok' : ' warn'}`}>{sy ? M.synced : M.saved}</span>}</span>
          </div>
        );
      })}
      <div class="mock-banner" style={`background:${!online ? 'var(--color-tint-sand)' : allSynced ? 'var(--color-ok-surface)' : 'var(--color-tint-sea)'};color:${!online ? '#6e5c34' : allSynced ? 'var(--color-secondary)' : 'var(--color-primary)'}`}>{msg}</div>
    </div>
  );
}

function NoiseMock({ M, t }: { M: Mock; t: number }) {
  const S = [52, 58, 49];
  const names = Object.values(M.sensors) as string[];
  const noise = (i: number, tt: number) => {
    let v = S[i]! + Math.round(5 * Math.sin(tt * 0.9 + i * 2.1));
    if (i === 1 && tt % 9 >= 5 && tt % 9 <= 6) v += 14;
    return v;
  };
  const bv = noise(1, t), over = bv > 65;
  const hist = Array.from({ length: 14 }, (_, j) => noise(1, Math.max(0, t - (13 - j))));
  return (
    <div class="mock">
      <div class="mock-top"><b>{M.title}</b><small>{M.limit} <strong>{M.limitValue}</strong></small></div>
      {S.map((_, i) => {
        const v = noise(i, t), o = v > 65;
        return (
          <div class="sens">
            <div class="sens-top"><span>{names[i]}</span><b style={`color:${o ? '#8e4b36' : 'inherit'}`}>{v} {M.unit}</b></div>
            <div class="sens-track"><i style={`width:${Math.min(100, (v / 90) * 100)}%;background:${o ? '#c98a72' : 'var(--color-primary)'}`} /><em /></div>
          </div>
        );
      })}
      <div class="mock-top" style="border:0;padding-bottom:0;margin-top:6px"><small>{M.history}</small></div>
      <div class="hist">{hist.map((v, j) => <i style={`height:${(v / 90) * 100}%;background:${v > 65 ? '#c98a72' : j === 13 ? 'var(--color-primary)' : '#b9cbd2'}`} />)}</div>
      <div class="mock-banner" style={`background:${over ? 'var(--color-tint-terra)' : 'var(--color-ok-surface)'};color:${over ? '#8e4b36' : 'var(--color-secondary)'}`}>{over ? M.over.replace('{value}', String(bv)) : M.ok}</div>
    </div>
  );
}

const LockIcon = () => (
  <span style="flex:none;position:relative;width:14px;height:16px" aria-hidden="true">
    <span style="position:absolute;left:2px;top:0;width:10px;height:9px;border:2px solid currentColor;border-bottom:none;border-radius: var(--radius-md)0 0" />
    <span style="position:absolute;left:0;bottom:0;width:14px;height:9px;background:currentColor;border-radius: var(--radius-md)" />
  </span>
);

export default function Proyectos({ projects, labels: L, locale, contactHref }: Props) {
  const feat = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const [cur, setCur] = useState(0);
  const [filter, setFilter] = useState<'all' | 'web' | 'app' | 'sensors'>('all');
  const [t, setT] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const moreRail = useRef<HTMLDivElement>(null);
  const sec = useRef<HTMLElement>(null);
  const vis = useRef(true);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((en) => (vis.current = en[0]!.isIntersecting));
    if (sec.current) io.observe(sec.current);
    const iv = setInterval(() => vis.current && setT((v) => v + 1), 1200);
    return () => {
      clearInterval(iv);
      io.disconnect();
    };
  }, []);

  const step = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? el.clientWidth;
  const goFeat = (i: number) => {
    const el = rail.current;
    if (!el) return;
    const n = Math.max(0, Math.min(feat.length - 1, i));
    el.scrollTo({ left: n * (step(el) + 16), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setCur(n);
  };
  const scrollMore = (dir: number) => moreRail.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  const filtered = more.filter((p) => filter === 'all' || p.category === filter);
  const count = (f: typeof filter) => (f === 'all' ? more.length : more.filter((p) => p.category === f).length);
  const mocks = [OrdersMock, SurveysMock, CountMock, NoiseMock];
  const mockKeys = ['orders', 'surveys', 'count', 'noise'];

  return (
    <section id="proyectos" class="prj" ref={sec}>
      <div class="prj-inner" data-reveal>
        <Eyebrow text={L.eyebrow} />
        <div class="prj-head">
          <div>
            <h2 class="prj-title">{L.title1} <span>{L.title2}</span></h2>
            <p class="prj-lead">{L.lead}</p>
          </div>
          <div class="prj-nav">
            <span class="prj-count">{L.counter.replace('{current}', String(cur + 1).padStart(2, '0')).replace('{total}', String(feat.length).padStart(2, '0'))}</span>
            <button type="button" class="prj-arrow" aria-label={L.previous} disabled={cur === 0} onClick={() => goFeat(cur - 1)}>←</button>
            <button type="button" class="prj-arrow next" aria-label={L.next} disabled={cur === feat.length - 1} onClick={() => goFeat(cur + 1)}>→</button>
          </div>
        </div>

        <div class="rail" ref={rail} data-lenis-prevent onScroll={(e) => {
          const el = e.currentTarget as HTMLElement;
          const i = Math.round(el.scrollLeft / (step(el) + 16));
          if (i !== cur) setCur(i);
        }}>
          {feat.map((p, i) => {
            const Mock = mocks[i] ?? OrdersMock;
            return (
              <article class="feat">
                <div class="feat-copy">
                  <div class="feat-meta">
                    <span><span>{p.year}</span><span class="type">{p.type}</span></span>
                    <span class={`status ${p.status}`}>{L.status[p.status]}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div class="chips">{p.includes.map((x) => <span>{x}</span>)}</div>
                  <div class="private"><div><LockIcon />{L.privateBadge}</div></div>
                </div>
                <div class="feat-mock">
                  <Mock M={L.mock[mockKeys[i] ?? 'orders']} t={t} locale={locale} />
                  <span class="mock-note">{L.illustrative}</span>
                </div>
              </article>
            );
          })}
        </div>
        <div class="prj-dots">
          {feat.map((_, i) => <button type="button" class={i === cur ? 'on' : ''} aria-label={L.goTo.replace('{n}', String(i + 1))} onClick={() => goFeat(i)} />)}
        </div>

        <div class="more">
          <div class="more-head">
            <h3>{L.moreTitle}</h3>
            <div class="prj-nav">
              <button type="button" class="prj-arrow" aria-label={L.scrollPrev} onClick={() => scrollMore(-1)}>←</button>
              <button type="button" class="prj-arrow next" aria-label={L.scrollNext} onClick={() => scrollMore(1)}>→</button>
            </div>
          </div>
          <div class="filters" role="group">
            {(['all', 'web', 'app', 'sensors'] as const).map((f) => (
              <button type="button" class={`filter${filter === f ? ' on' : ''}`} aria-pressed={filter === f} onClick={() => { setFilter(f); moreRail.current?.scrollTo({ left: 0 }); }}>
                {L.filters[f]}<small>{count(f)}</small>
              </button>
            ))}
          </div>
          <div class="more-rail" ref={moreRail} data-lenis-prevent>
            {filtered.map((p) => (
              <article class="card">
                <div class="card-top"><span>{p.year} · {p.type}</span><span class={`status ${p.status}`}>{L.status[p.status]}</span></div>
                <h4>{p.title}</h4>
                <p>{p.summary}</p>
                <ul>{p.includes.map((x) => <li>{x}</li>)}</ul>
                <div class="card-priv"><b>{L.privateTitle}</b>{L.privateText}</div>
              </article>
            ))}
          </div>
          <div class="prj-ask"><b>{L.askTitle}</b><a href={contactHref}>{L.askCta}</a></div>
        </div>
      </div>
    </section>
  );
}
