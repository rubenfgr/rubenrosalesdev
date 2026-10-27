import { useEffect, useRef, useState } from 'preact/hooks';
import './Hero.css';

interface Line { l1: string; l2: string; l3: string }
interface Pillar { title: string; text: string }
interface Props {
  headline: Line;
  lead: string;
  leadStrong: string;
  ctaPrimary: string;
  ctaSecondary: string;
  contactHref: string;
  projectsHref: string;
  pillars: { automation: Pillar; agents: Pillar; integrations: Pillar; custom: Pillar };
  stats: { projects: { value: string; label: string }; years: { value: string; label: string } };
}

export default function Hero(p: Props) {
  const [k, setK] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const reduced = useRef(false);

  const loop = () => {
    clearInterval(timer.current);
    if (reduced.current) return;
    timer.current = window.setInterval(() => setK((v) => (v + 1) % 4), 3000);
  };

  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    loop();
    return () => clearInterval(timer.current);
  }, []);

  const rows = [p.pillars.automation, p.pillars.agents, p.pillars.integrations, p.pillars.custom];
  const h = p.headline;
  // El punto final es el único gesto cálido de la pantalla.
  const dot = h.l3.endsWith('.');
  const l3 = dot ? h.l3.slice(0, -1) : h.l3;

  return (
    <section id="top" class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <h1 class="hero-title">
            {h.l1}<br />{h.l2}<br /><span class="solos">{l3}</span>{dot && <span class="dot">.</span>}
          </h1>
          <p class="hero-lead">{p.lead} <strong>{p.leadStrong}</strong></p>
          <div class="hero-ctas">
            <a class="btn btn-primary" href={p.contactHref}>{p.ctaPrimary} <span class="mono-arrow">→</span></a>
            <a class="hero-link" href={p.projectsHref}><span class="u">{p.ctaSecondary}</span> <span class="mono-arrow">→</span></a>
          </div>
        </div>
        <ol class="hero-list" onMouseEnter={() => clearInterval(timer.current)} onMouseLeave={loop} onFocusIn={() => clearInterval(timer.current)} onFocusOut={loop}>
          {rows.map((row, i) => (
            <li>
              <button
                type="button"
                class={`row${i === k ? ' on' : ''}`}
                aria-pressed={i === k}
                onClick={() => {
                  setK(i);
                  loop();
                }}
              >
                <span class="row-num">{String(i + 1).padStart(2, '0')}</span>
                <span class="row-title">{row.title}</span>
                <span class="row-sub">{row.text}</span>
                <span class="row-bar" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div class="hero-stats-wrap">
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">+{p.stats.projects.value}</span>
            <span class="stat-label">{p.stats.projects.label}</span>
          </div>
          <div class="stat">
            <span class="stat-value">+{p.stats.years.value}</span>
            <span class="stat-label">{p.stats.years.label}</span>
          </div>
        </div>
      </div>
      <div class="hilada hero-hilada" aria-hidden="true" />
    </section>
  );
}
