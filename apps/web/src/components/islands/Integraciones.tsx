import { useEffect, useRef, useState } from 'preact/hooks';
import './Integraciones.css';

type Source = 'email' | 'whatsapp' | 'forms' | 'pdf';
type Dest = 'erp' | 'crm' | 'excel' | 'accounting';
interface Case {
  id: string;
  source: Source;
  destination: Dest;
  sourceSub: string;
  pending: string;
  done: string;
  meta: string;
  steps: { read: string; check: string; register: string };
  humanApproval: string | null;
}
interface Labels {
  eyebrow: string; title1: string; title2: string; lead: string; otherTitle: string; otherText: string;
  exampleLabel: string; live: string; colIn: string; colDecide: string; colOut: string; traced: string;
  hub: { rules: string; process: string };
  sources: Record<Source, string>; destinations: Record<Dest, string>;
  todaySuffix: string; viewExample: string; waitingApproval: string; inProgress: string;
  metrics: { saved: string; tasks: string; human: string }; units: { hours: string; minutes: string };
}
interface Props { cases: Case[]; labels: Labels; approvedLabel: string; waitLabel: string }

const SOURCES: Source[] = ['email', 'whatsapp', 'forms', 'pdf'];
const DESTS: Dest[] = ['erp', 'crm', 'excel', 'accounting'];
const ICON: Record<string, string> = {
  email: 'M3 5h18v14H3zM3.5 6.5L12 13l8.5-6.5',
  whatsapp: 'M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z',
  forms: 'M7 3h10v18H7zM10 8h4M10 12h4M10 16h2',
  pdf: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  erp: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  crm: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-4-5.6',
  excel: 'M3 4h18v16H3zM3 10h18M3 15h18M9 4v16',
  accounting: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01',
};
const Icon = ({ n }: { n: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={ICON[n]} />
  </svg>
);

export default function Integraciones({ cases, labels: L, approvedLabel, waitLabel }: Props) {
  const [reduced, setReduced] = useState(false);
  const [c, setC] = useState(0);
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState([18, 27, 9, 12]);
  const [human, setHuman] = useState(3);
  const [saved, setSaved] = useState(66 * 9);
  const [narrow, setNarrow] = useState(false);
  const [visible, setVisible] = useState(true);
  const card = useRef<HTMLDivElement>(null);
  const sec = useRef<HTMLElement>(null);
  const state = useRef({ c, step, counts, human, saved });
  state.current = { c, step, counts, human, saved };
  const anim = useRef(0);

  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    if (rm) setStep(6);
    const ro = new ResizeObserver((en) => setNarrow(en[0]!.contentRect.width < 560));
    if (card.current) ro.observe(card.current);
    if (rm) return () => ro.disconnect();
    const io = new IntersectionObserver((en) => setVisible(en[0]!.isIntersecting));
    if (sec.current) io.observe(sec.current);
    const tween = (to: number) => {
      cancelAnimationFrame(anim.current);
      const from = state.current.saved, t0 = performance.now();
      const run = (t: number) => {
        const k = Math.min((t - t0) / 1400, 1);
        setSaved(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) anim.current = requestAnimationFrame(run);
      };
      anim.current = requestAnimationFrame(run);
    };
    const timer = setInterval(() => {
      const s = state.current;
      if (!document.hidden && vis.current) {
        const next = s.step + 1;
        if (next > 10) {
          setStep(0);
          setC((s.c + 1) % cases.length);
        } else if (next === 6) {
          const cs = cases[s.c]!;
          const n = s.counts.slice();
          n[DESTS.indexOf(cs.destination)]!++;
          setCounts(n);
          setHuman(s.human + (cs.humanApproval ? 1 : 0));
          setStep(next);
          tween(n.reduce((a, b) => a + b, 0) * 9);
        } else setStep(next);
      }
    }, 900);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(anim.current);
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  const vis = useRef(true);
  vis.current = visible;

  const cs = cases[c]!;
  const fade = step >= 10;
  const live = step >= 1 && !fade;
  const done = step >= 6 && !fade;
  const srcIdx = SOURCES.indexOf(cs.source);
  const dstIdx = DESTS.indexOf(cs.destination);
  const waiting = !!cs.humanApproval && step === 3;
  const ok = (n: number) => step >= n && !fade;
  const total = counts.reduce((a, b) => a + b, 0);
  const m = Math.round(saved);
  const pill = (on: boolean, text: string, wait = false) => (
    <div class={`int-pill${on ? ' on' : wait ? ' wait' : ''}`}>
      <span class="int-check" aria-hidden="true">{on ? '✓' : ''}</span>
      <span>{text}</span>
    </div>
  );
  const hubPills = (
    <>
      {pill(ok(2), cs.steps.read)}
      {pill(cs.humanApproval ? ok(4) : ok(3), waiting ? waitLabel : ok(4) && cs.humanApproval ? `${approvedLabel} · ${cs.humanApproval}` : cs.steps.check, waiting)}
      {pill(ok(5), cs.steps.register)}
    </>
  );
  const P = (i: number) => 12.5 + 25 * i;
  const pathIn = narrow ? `M${srcIdx % 2 ? 75 : 25} 0 V50 H50 V100` : `M0 ${P(srcIdx)} H50 V50 H100`;
  const pathOut = narrow ? `M50 0 V50 H${dstIdx % 2 ? 75 : 25} V100` : `M0 50 H50 V${P(dstIdx)} H100`;
  const allIn = (i: number) => (narrow ? `M${i % 2 ? 75 : 25} 0 V50 H50 V100` : `M0 ${P(i)} H50 V50 H100`);
  const allOut = (i: number) => (narrow ? `M50 0 V50 H${i % 2 ? 75 : 25} V100` : `M0 50 H50 V${P(i)} H100`);
  const sourceNode = (s: Source, i: number) => (
    <button type="button" class={`int-node${live && srcIdx === i ? ' lit' : ''}`} aria-label={fmtView(L.viewExample, L.sources[s])}
      onClick={() => {
        setC(cases.findIndex((x) => x.source === s));
        setStep(reduced ? 6 : 1);
      }}>
      <span class="int-ico"><Icon n={s} /></span>
      <span style="min-width:0"><span class="int-node-name">{L.sources[s]}</span>
        <span class="int-node-sub">{cases.find((x) => x.source === s)?.sourceSub}</span></span>
    </button>
  );
  const destNode = (d: Dest, i: number) => {
    const dd = done && dstIdx === i;
    return (
      <div class={`int-node${dd ? ' done' : ''}`}>
        <span class="int-ico"><Icon n={d} /></span>
        <span style="min-width:0"><span class="int-node-name">{L.destinations[d]}</span>
          <span class="int-node-sub shown">{counts[i]} {L.todaySuffix}{dd ? ' · +1' : ''}</span></span>
      </div>
    );
  };
  const conn = (paths: (i: number) => string, active: string, on: boolean, style: string) => (
    <svg class="int-conn" style={style} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <path d={paths(i)} />)}
      <path d={active} class={on ? 'active' : ''} style={on ? '' : 'opacity:0'} />
    </svg>
  );

  const hub = (
    <div class="int-hub" style={`box-shadow:${live && step >= 2 && step < 6 ? '0 0 0 4px rgb(40 90 110 / 0.14)' : '0 0 0 4px rgb(40 90 110 / 0.06)'}`}>
      <div class="int-hub-sub">{L.hub.rules}</div>
      <div class="int-hub-title">{L.hub.process}</div>
      <div class="int-pills">{hubPills}</div>
      <div class="int-traced">{L.traced}</div>
    </div>
  );

  return (
    <section id="integraciones" class="int" ref={sec}>
      <div class="int-inner" data-reveal>
        <div class="int-text">
          <h2 class="int-title">{L.title1} <span>{L.title2}</span></h2>
          <p class="int-lead">{L.lead}</p>
          <p class="int-other"><span>{L.otherTitle}</span> <strong>{L.otherText}</strong></p>
        </div>
        <div class={`int-card${narrow ? ' compact' : ''}`} ref={card}>
          <div class="int-top"><span class="int-card-title">{L.exampleLabel}</span><span class="int-live">{L.live}</span></div>
          <div class="int-body">
            {narrow ? (
              <div class="int-grid narrow">
                <div class="int-colhead" style="grid-column:1/3">{L.colIn}</div>
                {SOURCES.map(sourceNode)}
                {conn(allIn, pathIn, live && step < 5, 'grid-column:1/3;height:32px')}
                <div style="grid-column:1/3">{hub}</div>
                {conn(allOut, pathOut, step >= 5 && !fade, 'grid-column:1/3;height:32px')}
                <div class="int-colhead" style="grid-column:1/3">{L.colOut}</div>
                {DESTS.map(destNode)}
              </div>
            ) : (
              <div class="int-grid wide">
                <div class="int-colhead" style="grid-column:1">{L.colIn}</div>
                <div class="int-colhead" style="grid-column:3;text-align:center">{L.colDecide}</div>
                <div class="int-colhead" style="grid-column:5">{L.colOut}</div>
                {SOURCES.map((s, i) => <div style={`grid-column:1;grid-row:${i + 2};display:grid`}>{sourceNode(s, i)}</div>)}
                {conn(allIn, pathIn, live && step < 5, 'grid-column:2;grid-row:2/6')}
                <div style="grid-column:3;grid-row:2/6;display:grid">{hub}</div>
                {conn(allOut, pathOut, step >= 5 && !fade, 'grid-column:4;grid-row:2/6')}
                {DESTS.map((d, i) => <div style={`grid-column:5;grid-row:${i + 2};display:grid`}>{destNode(d, i)}</div>)}
              </div>
            )}
            <div class="int-cap" style={`opacity:${step >= 1 && !fade ? 1 : 0.55}`}>
              <span class={`int-cap-box${done ? ' done' : ''}`} aria-hidden="true">{done ? '✓' : ''}</span>
              <span><strong>{cs.pending && !done ? cs.pending : cs.done}</strong><small>{done ? cs.meta : waiting ? L.waitingApproval : L.inProgress}</small></span>
            </div>
          </div>
          <div class="int-metrics">
            <div class="int-metric"><b class="brand">{Math.floor(m / 60)} {L.units.hours} {String(m % 60).padStart(2, '0')} {L.units.minutes}</b><span>{L.metrics.saved}</span></div>
            <div class="int-metric"><b>{total}</b><span>{L.metrics.tasks}</span></div>
            <div class="int-metric"><b>{human}</b><span>{L.metrics.human}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function fmtView(t: string, source: string) {
  return t.replace('{source}', source);
}
