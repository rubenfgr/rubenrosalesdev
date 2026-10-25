import { useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './Calculadora.css';

// La fórmula no depende del idioma: horas/año = equipo × horas × semanas × % automatizado; € = horas × tarifa.
const WEEKS = 46;
const PCT = 0.7;
const FTE_HOURS = 1720;

interface Props {
  locale: string;
  contactHref: string;
  labels: {
    eyebrow: string; title1: string; title2: string; note: string; team: string; teamUnit: string; hours: string; hoursUnit: string;
    rate: string; rateUnit: string; annualSaving: string; perMonth: string; todayHours: string; automatedHours: string;
    recoveredHours: string; equivalent: string; fte: string; cta: string;
  };
}

export default function Calculadora({ locale, contactHref, labels: L }: Props) {
  const [team, setTeam] = useState(12);
  const [hours, setHours] = useState(6);
  const [rate, setRate] = useState(35);
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const eur = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const today = team * hours * WEEKS;
  const saved = Math.round(today * PCT);
  const money = saved * rate;
  const fte = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(saved / FTE_HOURS);
  const pct = new Intl.NumberFormat(locale, { style: 'percent' }).format(PCT);

  const field = (label: string, range: string, value: number, unit: string, min: number, max: number, set: (n: number) => void) => (
    <label style="display:block">
      <div class="calc-field-top"><span>{label}</span><span class="calc-range">{range}</span></div>
      <div class="calc-value">{value}<small>{unit}</small></div>
      <input type="range" min={min} max={max} step={1} value={value} onInput={(e) => set(+(e.currentTarget as HTMLInputElement).value)} />
    </label>
  );

  return (
    <section id="calculadora" class="calc">
      <div class="calc-inner" data-reveal>
        <Eyebrow text={L.eyebrow} />
        <div class="calc-head">
          <h2 class="calc-title">{L.title1} <span>{L.title2}</span></h2>
          <p class="calc-note">{L.note.replace('{pct}', pct).replace('{weeks}', String(WEEKS))}</p>
        </div>
        <div class="calc-grid">
          <div class="calc-inputs">
            {field(L.team, '1 — 100', team, L.teamUnit, 1, 100, setTeam)}
            {field(L.hours, '1 — 30', hours, L.hoursUnit, 1, 30, setHours)}
            {field(L.rate, '15 — 90 €', rate, L.rateUnit, 15, 90, setRate)}
          </div>
          <div class="calc-result" aria-live="polite">
            <div>
              <div class="calc-label">{L.annualSaving}</div>
              <div class="calc-money">{eur.format(money)}</div>
              <div class="calc-month">{L.perMonth.replace('{amount}', eur.format(money / 12))}</div>
            </div>
            <div class="calc-bars">
              <div>
                <div class="calc-bar-top"><span>{L.todayHours}</span><b>{nf.format(today)} h</b></div>
                <div class="calc-track"><div class="calc-fill before" /></div>
              </div>
              <div>
                <div class="calc-bar-top"><span>{L.automatedHours}</span><b>{nf.format(today - saved)} h</b></div>
                <div class="calc-track"><div class="calc-fill after" style={`width:${Math.max((1 - PCT) * 100, 2)}%`} /></div>
              </div>
            </div>
            <div class="calc-stats">
              <div class="calc-stat"><div>{L.recoveredHours}</div><div>{nf.format(saved)}</div></div>
              <div class="calc-stat"><div>{L.equivalent}</div><div>{fte} <small>{L.fte}</small></div></div>
            </div>
            <a class="calc-cta" href={contactHref}>{L.cta} <span class="mono-arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
