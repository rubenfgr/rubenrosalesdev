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

const TINTS = ['var(--color-tint-olive)', 'var(--color-tint-sea)', 'var(--color-tint-sand)', 'var(--color-tint-terra)'];
const G = 56, R = 240, PERIOD = 3400;

function Icon({ i }: { i: number }) {
  const common = { width: 28, height: 28, viewBox: '0 0 64 64', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': true } as const;
  const o = (t: string) => ({ style: `transform-origin:32px 32px;animation:${t}` });
  if (i === 0)
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="20" class="st-olive" stroke-dasharray="7 5" {...o('rrspin 7s linear infinite')} />
        <path d="M32 22v10l7 5" class="st-sand" />
      </svg>
    );
  if (i === 1)
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="19" class="st-brand" stroke-opacity="0.35" />
        <circle cx="32" cy="32" r="6" class="fl-brand" stroke="none" {...o('rrbeat 1.8s ease-in-out infinite')} />
        <g {...o('rrspin 4s linear infinite')}>
          <circle cx="32" cy="13" r="3.2" class="fl-sand" stroke="none" />
          <circle cx="48.5" cy="41.5" r="3.2" class="fl-olive" stroke="none" />
          <circle cx="15.5" cy="41.5" r="3.2" class="fl-terra" stroke="none" />
        </g>
      </svg>
    );
  if (i === 2)
    return (
      <svg {...common}>
        <rect x="6" y="24" width="16" height="16" rx="3" class="st-brand" />
        <rect x="42" y="24" width="16" height="16" rx="3" class="st-olive" />
        <path d="M22 32h20" class="st-sand" stroke-dasharray="4 3" style="animation:rrflow 0.8s linear infinite" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M22 20L10 32l12 12M42 20l12 12-12 12" class="st-terra" />
      <rect x="29" y="38" width="6" height="2.5" class="fl-brand" stroke="none" style="animation:rrblink 1s steps(1) infinite" />
    </svg>
  );
}

export default function Hero(p: Props) {
  const [k, setK] = useState(0);
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const reduced = useRef(false);

  const loop = () => {
    clearInterval(timer.current);
    if (reduced.current) return;
    timer.current = window.setInterval(() => setK((v) => (v + 1) % 4), 3000);
  };

  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    loop();
    if (reduced.current) return () => clearInterval(timer.current);
    let raf = 0;
    let pos: { x: number; y: number } | null = null;
    let inten = 0;
    const draw = (t: number) => {
      const el = sec.current, c = cv.current;
      if (el && c) {
        const w = el.offsetWidth, h = el.offsetHeight, dpr = Math.min(devicePixelRatio || 1, 2);
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
        }
        const ctx = c.getContext('2d')!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const m = mouse.current, idle = !m;
        const tx = m ? m.x : w * 0.62 + Math.cos(t / 9000) * w * 0.06;
        const ty = m ? m.y : h * 0.42 + Math.sin(t / 7000) * h * 0.06;
        if (!pos) pos = { x: tx, y: ty };
        pos.x += (tx - pos.x) * 0.055;
        pos.y += (ty - pos.y) * 0.055;
        inten += ((idle ? 0.55 : 1) - inten) * 0.04;
        const ph = (t % PERIOD) / PERIOD, ringR = ph * R * 1.15, ringA = Math.sin(Math.PI * ph);
        for (let gx = Math.floor((pos.x - R) / G); gx <= Math.ceil((pos.x + R) / G); gx++) {
          for (let gy = Math.floor((pos.y - R) / G); gy <= Math.ceil((pos.y + R) / G); gy++) {
            const px = gx * G + 0.5, py = gy * G + 0.5, d = Math.hypot(px - pos.x, py - pos.y), dd = d / R;
            const base = Math.exp(-dd * dd * 2.4) * 0.42;
            const wave = Math.exp(-Math.pow((d - ringR) / 26, 2)) * ringA * 0.38 * Math.exp(-dd * dd * 1.2);
            const al = (base + wave) * inten;
            if (al < 0.015) continue;
            ctx.fillStyle = `rgba(40,90,110,${al.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.4 + wave * 2.2, 0, 6.2832);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer.current);
    };
  }, []);

  const onMove = (e: MouseEvent) => {
    const r = sec.current?.getBoundingClientRect();
    if (r) mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const tiles = [p.pillars.automation, p.pillars.agents, p.pillars.integrations, p.pillars.custom];
  const h = p.headline;

  return (
    <section id="top" class="hero" ref={sec} onMouseMove={onMove} onMouseLeave={() => (mouse.current = null)}>
      <div class="hero-grid" aria-hidden="true" />
      <canvas class="hero-canvas" ref={cv} aria-hidden="true" />
      <div class="hero-inner">
        <div class="hero-copy">
          <h1 class="hero-title">
            {h.l1}<br />{h.l2}<br /><span class="grad">{h.l3}</span>
          </h1>
          <p class="hero-lead">{p.lead} <strong>{p.leadStrong}</strong></p>
          <div class="hero-ctas">
            <a class="btn btn-primary" href={p.contactHref}>{p.ctaPrimary} <span class="mono-arrow">→</span></a>
            <a class="btn btn-secondary" href={p.projectsHref}>{p.ctaSecondary}</a>
          </div>
        </div>
        <div class="hero-tiles">
          {tiles.map((tile, i) => (
            <button
              type="button"
              class={`tile${i === k ? ' on' : ''}`}
              style={`--tint:${TINTS[i]}`}
              aria-label={tile.title}
              aria-pressed={i === k}
              onClick={() => {
                setK(i);
                loop();
              }}
            >
              <span class="tile-icon"><Icon i={i} /></span>
              <span class="tile-text">
                <span class="tile-title">{tile.title}</span>
                <span class="tile-sub">{tile.text}</span>
              </span>
              <span class="tile-bar" />
            </button>
          ))}
        </div>
      </div>
      <div class="hero-stats-wrap">
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value"><span class="plus">+</span>{p.stats.projects.value}</span>
            <span class="stat-label">{p.stats.projects.label}</span>
          </div>
          <div class="stat">
            <span class="stat-value"><span class="plus">+</span>{p.stats.years.value}</span>
            <span class="stat-label">{p.stats.years.label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
