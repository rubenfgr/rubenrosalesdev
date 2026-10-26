import { useEffect, useRef, useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './Servicios.css';

interface Service { id: string; number: string; name: string; title: string; body: string }
interface Labels {
  eyebrow: string; title1: string; title2: string; lead: string; techNote: string; techCta: string;
  demo: {
    flow: Record<'order' | 'stock' | 'invoice' | 'payment', { label: string; sub: string }>;
    doc: { supplier: string; taxId: string; title: string; number: string; client: string; issued: string; due: string; concept: string; qty: string; amount: string;
      lines: Record<'l1' | 'l2' | 'l3' | 'l4', { text: string; qty: string; amount: string }>;
      base: string; baseValue: string; vat: string; vatValue: string; total: string; totalValue: string };
    extracted: string; field: string; value: string;
    fields: Record<'supplier' | 'number' | 'due' | 'base' | 'vat' | 'total', { label: string; value: string }>;
    reading: string; recorded: string;
    dash: { title: string; live: string; billed: string; billedDelta: string; orders: string; ordersDelta: string; ticket: string; ticketDelta: string; weekly: string; target: string; week: string; byChannel: string; store: string; web: string; distributors: string };
    phone: { date: string; time: string; network: string; now: string; minutesAgo: string; n1: { title: string; text: string }; n2: { title: string; text: string }; n3: { title: string; text: string } };
  };
}
interface Props { services: Service[]; labels: Labels; locale: string; contactHref: string }

const FIELD_KEYS = ['supplier', 'number', 'due', 'base', 'vat', 'total'] as const;
const FLOW_KEYS = ['order', 'stock', 'invoice', 'payment'] as const;

export default function Servicios({ services, labels: L, locale, contactHref }: Props) {
  const [t, setT] = useState(0);
  const root = useRef<HTMLElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(5);
      return;
    }
    const io = new IntersectionObserver((en) => (visible.current = en[0]!.isIntersecting));
    if (root.current) io.observe(root.current);
    const iv = setInterval(() => visible.current && setT((v) => v + 1), 1300);
    return () => {
      clearInterval(iv);
      io.disconnect();
    };
  }, []);

  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const D = L.demo;
  const fs = t % 6;
  const fr = t % 10;
  const g = t === 0 ? 0 : Math.min(t % 8, 5) / 5;
  const base = [52, 61, 48, 66, 58, 72, 69];
  const fact = 40870 + Math.round(7340 * g);
  const peds = 158 + Math.round(28 * g);
  const nc = Math.min(t % 6, 3);
  const notifs = [D.phone.n1, D.phone.n2, D.phone.n3];
  const by = Object.fromEntries(services.map((s) => [s.id, s])) as Record<string, Service>;
  const head = (s: Service) => (
    <div class="srv-top">
      <div class="srv-meta"><span>{s.number}</span><span>{s.name}</span></div>
      <h3 class="srv-h">{s.title}</h3>
      <p class="srv-p">{s.body}</p>
    </div>
  );

  return (
    <section id="servicios" class="srv" ref={root}>
      <div class="srv-inner" data-reveal>
        <Eyebrow text={L.eyebrow} />
        <div class="srv-head">
          <h2 class="srv-title">{L.title1} <span>{L.title2}</span></h2>
          <p class="srv-lead">{L.lead}</p>
        </div>
        <div class="srv-bento">
          <article class="srv-card srv-a">
            {head(by.automation!)}
            <div class="flow srv-demo" style="margin-top:28px">
              {FLOW_KEYS.map((k, i) => {
                const done = i < fs, active = i === fs;
                return (
                  <>
                    {i > 0 && <span class={`flow-conn${i <= fs ? ' on' : ''}`} />}
                    <div class={`flow-step${active ? ' active' : done ? ' done' : ''}`}>
                      <span class="flow-dot">{done ? '✓' : active ? '•' : ''}</span>
                      <span><b>{D.flow[k].label}</b><small>{D.flow[k].sub}</small></span>
                    </div>
                  </>
                );
              })}
            </div>
          </article>

          <article class="srv-card dark srv-b">
            {head(by['applied-ai']!)}
            <div class="srv-demo" style="margin-top:24px">
              <div class="doc">
                <div class="doc-head">
                  <span class="doc-sup"><b class={`hl${fr === 1 ? ' on' : ''}`}>{D.doc.supplier}</b><small>{D.doc.taxId}</small></span>
                  <span class="doc-title"><b>{D.doc.title}</b><span class={`hl${fr === 2 ? ' on' : ''}`}>{D.doc.number}</span></span>
                </div>
                <div class="doc-mid"><span>{D.doc.client}</span><span>{D.doc.issued} <span class={`hl${fr === 3 ? ' on' : ''}`}>{D.doc.due}</span></span></div>
                <div class="doc-tab">
                  <span class="h">{D.doc.concept}</span><span class="h r">{D.doc.qty}</span><span class="h r">{D.doc.amount}</span>
                  {(['l1', 'l2', 'l3', 'l4'] as const).map((k) => (
                    <>
                      <span>{D.doc.lines[k].text}</span><span class="r">{D.doc.lines[k].qty}</span><span class="r">{D.doc.lines[k].amount}</span>
                    </>
                  ))}
                </div>
                <div class="doc-tot">
                  <div>
                    <span>{D.doc.base}</span><span class={`hl${fr === 4 ? ' on' : ''}`}>{D.doc.baseValue}</span>
                    <span>{D.doc.vat}</span><span class={`hl${fr === 5 ? ' on' : ''}`}>{D.doc.vatValue}</span>
                    <span class="grand">{D.doc.total}</span><span class={`grand hl${fr === 6 ? ' on' : ''}`}>{D.doc.totalValue}</span>
                  </div>
                </div>
              </div>
              <div class="srv-sep">{D.extracted}</div>
              <div class="ext">
                <div class="ext-head"><span>{D.field}</span><span>{D.value}</span></div>
                {FIELD_KEYS.map((k, i) => (
                  <div class={`ext-row${i === fr - 1 ? ' on' : ''}`}>
                    <span>{D.fields[k].label}</span>
                    <span style={`opacity:${i < fr ? 1 : 0};transform:translateX(${i < fr ? 0 : 8}px)`}>{D.fields[k].value}</span>
                  </div>
                ))}
                <div class={`stamp${fr >= 7 ? ' ok' : ''}`}>{fr >= 7 ? D.recorded : D.reading}</div>
              </div>
            </div>
          </article>

          <article class="srv-card srv-c">
            {head(by['custom-software']!)}
            <div class="dash srv-demo">
              <div class="dash-top"><b>{D.dash.title}</b><span class="dash-live">{D.dash.live}</span></div>
              <div class="kpis">
                <div class="kpi"><span class="l">{D.dash.billed}</span><span class="v">{nf.format(fact)} €</span><span class="d">{D.dash.billedDelta}</span></div>
                <div class="kpi"><span class="l">{D.dash.orders}</span><span class="v">{peds}</span><span class="d">{D.dash.ordersDelta}</span></div>
                <div class="kpi"><span class="l">{D.dash.ticket}</span><span class="v">{nf.format(Math.round(fact / peds))} €</span><span class="d">{D.dash.ticketDelta}</span></div>
              </div>
              <div class="charts">
                <div>
                  <div class="chart-head"><h4>{D.dash.weekly}</h4><span class="goal-key">{D.dash.target}</span></div>
                  <div class="bars">
                    <span class="goal" />
                    {base.map((v) => <i style={`height:${t === 0 ? 0 : v}%`} />)}
                    <i class="now" style={`height:${Math.round(30 + 54 * g)}%`} />
                  </div>
                  <div class="weeks">{[37, 38, 39, 40, 41, 42, 43, 44].map((n) => <span>{D.dash.week.replace('{n}', String(n))}</span>)}</div>
                </div>
                <div>
                  <h4>{D.dash.byChannel}</h4>
                  {([[D.dash.store, 52, 'var(--color-primary)'], [D.dash.web, 31, 'var(--color-primary-light)'], [D.dash.distributors, 17, 'var(--color-accent)']] as const).map(([n, p, c]) => (
                    <div class="chan">
                      <div class="chan-top"><span>{n}</span><span>{p}%</span></div>
                      <div class="chan-track"><i style={`width:${t === 0 ? 0 : p}%;background:${c}`} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article class="srv-card tint srv-d">
            {head(by['mobile-apps']!)}
            <div class="phone-wrap">
              <div class="phone">
                <div class="phone-body">
                  <div class="phone-screen">
                    <span class="phone-island" />
                    <div class="phone-status"><span>{D.phone.time}</span><span>{D.phone.network}</span></div>
                    <div class="phone-date"><span>{D.phone.date}</span><b>{D.phone.time}</b></div>
                    <div class="notifs">
                      {notifs.map((n, i) => {
                        const on = i < nc, age = nc - 1 - i;
                        return (
                          <div class="notif" style={`opacity:${on ? 1 : 0};transform:translateY(${on ? 0 : -14}px) scale(${on ? 1 : 0.96})`}>
                            <span class="notif-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></svg></span>
                            <span class="notif-main">
                              <span class="notif-top"><span>{n.title}</span><span>{age <= 0 ? D.phone.now : D.phone.minutesAgo.replace('{n}', String(age * 2))}</span></span>
                              <small>{n.text}</small>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
        <p class="srv-foot">{L.techNote} <a href={contactHref}>{L.techCta}</a></p>
      </div>
    </section>
  );
}
