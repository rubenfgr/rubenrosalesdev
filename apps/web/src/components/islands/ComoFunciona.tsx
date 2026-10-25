import { useEffect, useRef, useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './ComoFunciona.css';

type Who = 'auto' | 'approved' | 'corrected';
interface Item { id: string; tag: 'order' | 'pdf' | 'email'; title: string; from: string; confidence: number; done: string; why: string; approveLabel?: string | undefined }
interface Mode { id: string; label: string; description: string; threshold: number }
interface Entry { id: string; time: string; action: string; why: string; who: Who }
interface Props {
  items: Item[];
  modes: Mode[];
  log: Entry[];
  labels: {
    eyebrow: string; title1: string; title2: string; lead: string; howMuchFreedom: string; pause: string; resume: string; isItClear: string;
    confidence: { yes: string; maybe: string; no: string }; waitingForOk: string; nothingPending: string; approve: string; doItMyself: string;
    logTitle: string; today: string; who: Record<Who, string>; tags: Record<Item['tag'], string>;
    badges: { euTitle: string; euText: string; ownTitle: string; ownText: string };
    reading: string; handOver: string; asks: string; paused: string; selfHandled: string; selfHandledWhy: string;
  };
}

const fmtT = (m: number) => `9:${String(m).padStart(2, '0')}`;

export default function ComoFunciona({ items, modes, log: seed, labels: L }: Props) {
  const [mode, setMode] = useState(1);
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [min, setMin] = useState(12);
  const [log, setLog] = useState<Entry[]>(seed);
  const [pending, setPending] = useState<{ id: string; item: Item }[]>([]);
  const [seq, setSeq] = useState(0);
  const st = useRef({ mode, paused, idx, phase, min, seq });
  st.current = { mode, paused, idx, phase, min, seq };
  const sec = useRef<HTMLElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIdx(3);
      setPhase(2);
      setPending([{ id: 'p0', item: items[3]! }]);
      return;
    }
    const io = new IntersectionObserver((en) => (visible.current = en[0]!.isIntersecting));
    if (sec.current) io.observe(sec.current);
    const iv = setInterval(() => {
      const s = st.current;
      if (s.paused || !visible.current) return;
      if (s.phase < 4) {
        const next = s.phase + 1;
        setPhase(next);
        if (next === 2) {
          const it = items[s.idx]!, n = s.seq + 1;
          setSeq(n);
          if (it.confidence < modes[s.mode]!.threshold) setPending((p) => [{ id: `p${n}`, item: it }, ...p].slice(0, 2));
          else setLog((l) => [{ id: `l${n}`, time: fmtT(s.min), action: it.done, why: it.why, who: 'auto' as Who }, ...l].slice(0, 5));
        }
      } else {
        setPhase(0);
        setIdx((s.idx + 1) % items.length);
        setMin(s.min + 3 > 59 ? 12 : s.min + 3);
      }
    }, 850);
    return () => {
      clearInterval(iv);
      io.disconnect();
    };
  }, []);

  const resolve = (id: string, how: 'ok' | 'fix') => {
    const p = pending.find((x) => x.id === id);
    if (!p) return;
    const n = seq + 1;
    setSeq(n);
    const entry: Entry =
      how === 'ok'
        ? { id: `l${n}`, time: fmtT(min), action: p.item.done, why: p.item.why, who: 'approved' }
        : { id: `l${n}`, time: fmtT(min), action: L.selfHandled, why: L.selfHandledWhy.replace('{title}', p.item.title), who: 'corrected' };
    setPending((x) => x.filter((y) => y.id !== id));
    setLog((l) => [entry, ...l].slice(0, 5));
  };

  const it = items[idx]!;
  const m = modes[mode]!;
  const ask = it.confidence < m.threshold;
  const shown = phase >= 1;
  const confColor = it.confidence >= 85 ? 'var(--color-ok)' : it.confidence >= 50 ? 'var(--color-accent-soft)' : '#d9967f';
  const confWord = it.confidence >= 85 ? L.confidence.yes : it.confidence >= 50 ? L.confidence.maybe : L.confidence.no;
  let out = L.reading, outBg = 'rgb(154 162 158 / 0.1)', outColor = 'var(--color-dark-text-subtle)';
  if (phase >= 2) {
    if (ask) { out = mode === 0 ? L.handOver : L.asks; outBg = 'rgb(201 183 143 / 0.14)'; outColor = 'var(--color-accent-soft)'; }
    else { out = it.done; outBg = 'rgb(169 184 140 / 0.16)'; outColor = 'var(--color-ok)'; }
  }
  if (paused) { out = L.paused; outBg = 'rgb(217 150 127 / 0.14)'; outColor = '#d9967f'; }

  return (
    <section id="como-funciona" class="tray" ref={sec}>
      <div class="tray-inner" data-reveal>
        <Eyebrow text={L.eyebrow} />
        <div class="tray-head">
          <h2 class="tray-title">{L.title1} <span>{L.title2}</span></h2>
          <p class="tray-lead">{L.lead}</p>
        </div>
        <div class="tray-grid">
          <div class="tray-ctl">
            <div class="tray-row">
              <span><span class="tray-num">2.1</span><span class="tray-sub">{L.howMuchFreedom}</span></span>
              <button type="button" class={`tray-pause${paused ? ' on' : ''}`} onClick={() => setPaused(!paused)}>{paused ? L.resume : L.pause}</button>
            </div>
            <div class="tray-modes" role="radiogroup">
              {modes.map((x, i) => (
                <button type="button" role="radio" aria-checked={i === mode} class={`tray-mode${i === mode ? ' on' : ''}`} onClick={() => setMode(i)}>{x.label}</button>
              ))}
            </div>
            <p class="tray-desc">{m.description}</p>
            <div class="tray-cur" style={`opacity:${paused ? 0.6 : 1}`}>
              <div class="tray-cur-top">
                <span class="tray-tag">{L.tags[it.tag]}</span>
                <span style="min-width:0;flex:1"><b>{it.title}</b><small>{it.from}</small></span>
              </div>
              <div class="tray-conf"><span>{L.isItClear}</span><b style={`color:${shown ? confColor : 'var(--color-dark-border-strong)'}`}>{shown ? confWord : '…'}</b></div>
              <div class="tray-track"><div class="tray-fill" style={`width:${shown ? it.confidence : 0}%;background:${shown ? confColor : 'var(--color-dark-border-strong)'}`} /></div>
              <div class="tray-out" style={`background:${outBg};color:${outColor}`}>{out}</div>
            </div>
            <div class="tray-pending">
              <div class="tray-pending-top"><span>{L.waitingForOk}</span><span>{pending.length}</span></div>
              {pending.length === 0 && <div class="tray-empty">{L.nothingPending}</div>}
              {pending.map((p) => (
                <div class="tray-ask">
                  <span><b>{p.item.title}</b><span>{p.item.why}</span></span>
                  <div class="tray-btns">
                    <button type="button" class="tray-btn" onClick={() => resolve(p.id, 'ok')}>{p.item.approveLabel ?? L.approve}</button>
                    <button type="button" class="tray-btn alt" onClick={() => resolve(p.id, 'fix')}>{L.doItMyself}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div class="tray-log">
            <div class="tray-row">
              <span><span class="tray-num">2.2</span><span class="tray-sub">{L.logTitle}</span></span>
              <span style="font-size:12px;color:var(--color-foreground-muted)">{L.today}</span>
            </div>
            <div class="tray-log-list">
              {log.map((l) => (
                <div class="tray-entry">
                  <span class="tray-time">{l.time}</span>
                  <span style="min-width:0">
                    <span class="tray-act">{l.action}<span class={`tray-who ${l.who}`}>{L.who[l.who]}</span></span>
                    <span class="tray-why">{l.why}</span>
                  </span>
                </div>
              ))}
            </div>
            <div class="tray-badges">
              <span><strong>{L.badges.euTitle}</strong>{L.badges.euText}</span>
              <span><strong>{L.badges.ownTitle}</strong>{L.badges.ownText}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
