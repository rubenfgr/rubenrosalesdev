import { useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './Problema.css';

interface Task { id: string; label: string; path: string; hoursPerWeek: number; defaultOn: boolean }
interface Props {
  tasks: Task[];
  locale: string;
  labels: {
    eyebrow: string; title1: string; title2: string; lead: string; manualPerWeek: string; recovered: string; hoursUnit: string;
    listTitle: string; listSubtitle: string; automateAll: string; reset: string; automated: string; hoursPerWeek: string;
    returned: string; daysPerMonth: string;
  };
}

export default function Problema({ tasks, labels: L, locale }: Props) {
  const [on, setOn] = useState<boolean[]>(tasks.map((t) => t.defaultOn));
  const saved = tasks.reduce((s, t, i) => s + (on[i] ? t.hoursPerWeek : 0), 0);
  const manual = tasks.reduce((s, t) => s + t.hoursPerWeek, 0) - saved;
  const days = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.round(((saved * 4.3) / 8) * 2) / 2);
  const allOn = on.every(Boolean);
  return (
    <section class="prob" id="problema">
      <div class="hilada prob-hilada" aria-hidden="true" />
      <div class="prob-inner" data-reveal>
        <Eyebrow text={L.eyebrow} dark />
        <div class="prob-grid">
          <div>
            <h2 class="prob-title">{L.title1} <span>{L.title2}</span></h2>
            <p class="prob-lead">{L.lead}</p>
            <div class="prob-kpis" aria-live="polite">
              <div class="prob-kpi"><div class="prob-kpi-label">{L.manualPerWeek}</div><div class="prob-kpi-value">{manual}<small>{L.hoursUnit}</small></div></div>
              <div class="prob-kpi ok"><div class="prob-kpi-label">{L.recovered}</div><div class="prob-kpi-value">{saved}<small>{L.hoursUnit}</small></div></div>
            </div>
          </div>
          <div class="prob-panel">
            <div class="prob-panel-head">
              <div><strong>{L.listTitle}</strong><span>{L.listSubtitle}</span></div>
              <button type="button" class="prob-all" onClick={() => setOn(tasks.map(() => !allOn))}>{allOn ? L.reset : L.automateAll}</button>
            </div>
            <div class="prob-list">
              {tasks.map((t, i) => (
                <button type="button" class={`prob-row${on[i] ? ' on' : ''}`} role="checkbox" aria-checked={on[i]} onClick={() => setOn(on.map((v, j) => (j === i ? !v : v)))}>
                  <span class="prob-box" aria-hidden="true">{on[i] ? '✓' : ''}</span>
                  <span><span class="prob-label">{t.label}</span><span class="prob-path">{t.path}</span></span>
                  <span class="prob-tag">{on[i] ? L.automated : L.hoursPerWeek.replace('{hours}', String(t.hoursPerWeek))}</span>
                </button>
              ))}
            </div>
            <div class="prob-foot"><span>{L.returned}</span><b>{L.daysPerMonth.replace('{days}', days)}</b></div>
          </div>
        </div>
      </div>
    </section>
  );
}
