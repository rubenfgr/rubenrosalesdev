import { useState } from 'preact/hooks';
import { buildLog, classify, tally, type Resolution, type TrayEntry } from '../../lib/tray';
import Eyebrow from './Eyebrow';
import './ComoFunciona.css';

interface Item { id: string; tag: 'order' | 'pdf' | 'email'; title: string; from: string; confidence: number; done: string; why: string; approveLabel?: string | undefined }
interface Mode { id: string; label: string; description: string; threshold: number }
interface Props {
  items: Item[];
  modes: Mode[];
  log: TrayEntry[];
  labels: {
    eyebrow: string; title1: string; title2: string; lead: string; howMuchFreedom: string; approve: string; doItMyself: string;
    logTitle: string; today: string; who: Record<TrayEntry['who'], string>; tags: Record<Item['tag'], string>;
    badges: { euTitle: string; euText: string; ownTitle: string; ownText: string };
    selfHandled: string; selfHandledWhy: string;
    listTitle: string; clearness: string; autoLabel: string; reviewLabel: string; thresholdNote: string; thresholdNone: string;
    state: Record<'auto' | 'review' | 'approved' | 'corrected', string>; reset: string; marker: string; example: string;
  };
}

export default function ComoFunciona({ items, modes, log: seed, labels: L }: Props) {
  const [mode, setMode] = useState(1);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});

  const m = modes[mode]!;
  const rows = classify(items, m.threshold, resolved);
  const count = tally(rows);
  const log = buildLog(rows, seed, L).slice(0, 7);
  const note = m.threshold > 100 ? L.thresholdNone : L.thresholdNote.replace('{n}', String(m.threshold));
  const decide = (id: string, how: Resolution) => setResolved({ ...resolved, [id]: how });

  return (
    <section id="como-funciona" class="tray">
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
              {Object.keys(resolved).length > 0 && <button type="button" class="tray-reset" onClick={() => setResolved({})}>{L.reset}</button>}
            </div>
            <div class="tray-modes" role="radiogroup" aria-label={L.howMuchFreedom}>
              {modes.map((x, i) => (
                <button type="button" role="radio" aria-checked={i === mode} class={`tray-mode${i === mode ? ' on' : ''}`} onClick={() => setMode(i)}>{x.label}</button>
              ))}
            </div>
            <div class="tray-purpose" aria-live="polite">
              <p class="tray-desc">{m.description}</p>
              <p class="tray-note">{note}</p>
            </div>
            <div class="tray-count" aria-live="polite">
              <div class="tray-stat auto"><b>{count.auto}</b><span>{L.autoLabel}</span></div>
              <div class="tray-stat review"><b>{count.review}</b><span>{L.reviewLabel}</span></div>
              <span class="tray-eg">{L.example}</span>
            </div>
            <ul class="tray-list" aria-label={L.listTitle}>
              {rows.map(({ item, state }) => (
                <li class={`tray-item ${state}`}>
                  <div class="tray-item-top">
                    <span class="tray-tag">{L.tags[item.tag]}</span>
                    <span class="tray-item-main"><b>{item.title}</b><small>{item.from}</small></span>
                    <span class={`tray-state ${state}`}>{L.state[state]}</span>
                  </div>
                  <div class="tray-meter" role="img" aria-label={`${L.clearness}: ${item.confidence} %`}>
                    <div class="tray-bar">
                      <div class="tray-track"><div class={`tray-fill ${state}`} style={`width:${item.confidence}%`} /></div>
                      {m.threshold <= 100 && <i class="tray-mark" style={`left:${m.threshold}%`} title={L.marker} />}
                    </div>
                    <span class="tray-pct">{item.confidence} %</span>
                  </div>
                  <p class="tray-item-why">{state === 'auto' || state === 'approved' ? item.done : item.why}</p>
                  {state === 'review' && (
                    <div class="tray-btns">
                      <button type="button" class="tray-btn" onClick={() => decide(item.id, 'approved')}>{item.approveLabel ?? L.approve}</button>
                      <button type="button" class="tray-btn alt" onClick={() => decide(item.id, 'corrected')}>{L.doItMyself}</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div class="tray-log">
            <div class="tray-row">
              <span><span class="tray-num">2.2</span><span class="tray-sub">{L.logTitle}</span></span>
              <span class="tray-today">{L.today}</span>
            </div>
            <div class="tray-log-list">
              {log.map((l) => (
                <div class="tray-entry" key={l.id}>
                  <span class="tray-time">{l.time}</span>
                  <span class="tray-entry-body">
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
