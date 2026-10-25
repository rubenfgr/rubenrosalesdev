import { useEffect, useRef, useState } from 'preact/hooks';
import { canEstimate, estimate, matchRule, type Ctx, type Estimate, type Pricing } from '@rr/shared/engine';
import './Assistant.css';

interface Data {
  consent: { title: string; body: string[]; more: string; privacyLabel: string; accept: string; decline: string };
  panel: { title: string; status: string; banner: string; disclaimer: string };
  greeting: string[];
  steps: Record<string, { action: string; label: string }[]>;
  actions: Record<string, { say: string[]; step: string }>;
  rules: { pattern: string; action: string }[];
  types: Record<string, string>; systems: Record<string, string>; team: Record<string, string>;
  estimate: { title: string; confidence: string; levels: Record<'low' | 'medium' | 'high', string>; weeks: string; upTitle: string; up: string; downTitle: string; down: string; disclaimer: string };
  form: { name: string; namePlaceholder: string; email: string; emailPlaceholder: string; consent: string; submit: string; sending: string; errors: Record<'name' | 'email' | 'consent' | 'send', string> };
  summary: { title: string; rows: Record<'name' | 'email' | 'project' | 'tools' | 'team' | 'range', string>; rangeNote: string; footer: string; thanks: string; userSent: string };
}
interface Labels { fabAria: string; panelAria: string; close: string; restart: string; send: string; messageAria: string; inputPlaceholder: string; fabTitle: string; fabSubtitle: string }
interface Props { data: Data; pricing: Pricing; labels: Labels; lang: string; locale: string; showEstimates?: boolean; endpoint: string; privacyHref: string }

type Msg =
  | { kind: 'bot' | 'user'; text: string }
  | { kind: 'estimate'; est: Estimate; label: string; range: string }
  | { kind: 'summary'; rows: { k: string; v: string }[] };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Assistant({ data: D, pricing, labels: L, lang, locale, showEstimates = true, endpoint, privacyHref }: Props) {
  const [open, setOpen] = useState(false);
  // Aviso de privacidad (D-4): hasta elegir, no se muestra el chat ni se envía nada. 'yes' = guardar la conversación.
  const [consent, setConsent] = useState<'yes' | 'no' | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState('start');
  const [draft, setDraft] = useState('');
  const [ctx, setCtx] = useState<Ctx>({});
  const [form, setForm] = useState({ name: '', email: '', consent: false });
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const started = useRef(Date.now());
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
  }, [messages.length, typing, step]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const fmtRange = (e: Estimate) => {
    const nf = new Intl.NumberFormat(locale);
    return `${nf.format(e.minEur)} – ${nf.format(e.maxEur)} €`;
  };
  const bot = (items: (string | Msg)[], next: string) => {
    setTyping(true);
    setStep('wait');
    let i = 0;
    const push = () => {
      const item = items[i]!;
      i++;
      const msg: Msg = typeof item === 'string' ? { kind: 'bot', text: item } : item;
      const last = i >= items.length;
      setMessages((m) => [...m, msg]);
      setTyping(!last);
      if (last) setStep(next);
      else timer.current = window.setTimeout(push, reduced() ? 0 : 650);
    };
    timer.current = window.setTimeout(push, reduced() ? 0 : 700);
  };
  const say = (action: string, extra: (string | Msg)[] = []) => {
    const a = D.actions[action];
    if (a) bot([...a.say, ...extra], a.step);
  };
  const user = (text: string) => setMessages((m) => [...m, { kind: 'user', text }]);
  const boot = () => {
    if (!messages.length) bot(D.greeting, 'start');
  };
  const toggle = () => {
    if (open) return setOpen(false);
    setOpen(true);
    if (consent) boot();
    setTimeout(() => innerWidth >= 560 && input.current?.focus(), 80);
  };
  const choose = (value: 'yes' | 'no') => {
    setConsent(value);
    bot(D.greeting, 'start');
  };
  const restart = () => {
    if (!consent) return;
    clearTimeout(timer.current);
    setMessages([]);
    setCtx({});
    setTyping(false);
    setStep('start');
    setFormError('');
    setTimeout(() => bot(D.greeting, 'start'), 0);
  };

  const finishEstimate = (c: Required<Ctx>) => {
    const est = showEstimates ? estimate(pricing, c) : null;
    if (!est) return say('noEstimate');
    const a = D.actions.estimateIntro!, b = D.actions.estimateOutro!;
    bot([...a.say, { kind: 'estimate', est, label: D.types[c.type] ?? c.type, range: fmtRange(est) }, ...b.say], b.step);
  };

  const pick = (action: string, label: string) => {
    user(label);
    if (D.types[action]) {
      setCtx((c) => ({ ...c, type: action }));
      return say('typeChosen');
    }
    if (D.systems[action]) {
      setCtx((c) => ({ ...c, systems: action }));
      return say('systemsChosen');
    }
    if (D.team[action]) {
      const next = { ...ctxRef.current, team: action };
      setCtx(next);
      if (canEstimate(next)) return finishEstimate(next);
      return say('noEstimate');
    }
    if (action === 'proyecto') setCtx({});
    say(action);
  };

  const options: { action: string; label: string }[] =
    step === 'type' ? Object.entries(D.types).map(([a, l]) => ({ action: a, label: l }))
    : step === 'systems' ? Object.entries(D.systems).map(([a, l]) => ({ action: a, label: l }))
    : step === 'team' ? Object.entries(D.team).map(([a, l]) => ({ action: a, label: l }))
    : D.steps[step] ?? [];

  const onSend = (e: Event) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || typing) return;
    setDraft('');
    user(t);
    say(matchRule(D.rules, t) ?? 'fallback');
  };

  const submitContact = async () => {
    const name = form.name.trim();
    if (!name) return setFormError(D.form.errors.name);
    if (!EMAIL_RE.test(form.email)) return setFormError(D.form.errors.email);
    if (!form.consent) return setFormError(D.form.errors.consent);
    const rows = [{ k: D.summary.rows.name, v: name }, { k: D.summary.rows.email, v: form.email.trim() }];
    if (ctx.type) rows.push({ k: D.summary.rows.project, v: D.types[ctx.type] ?? ctx.type });
    if (ctx.systems) rows.push({ k: D.summary.rows.tools, v: D.systems[ctx.systems] ?? ctx.systems });
    if (ctx.team) rows.push({ k: D.summary.rows.team, v: D.team[ctx.team] ?? ctx.team });
    if (showEstimates && canEstimate(ctx)) {
      const est = estimate(pricing, ctx);
      if (est) rows.push({ k: D.summary.rows.range, v: D.summary.rangeNote.replace('{range}', fmtRange(est)) });
    }
    setFormError('');
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'assistant', startedAt: started.current, lang, name, email: form.email.trim(), consent: true, summary: rows.map((r) => `${r.k}: ${r.v}`) }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSending(false);
      return setFormError(D.form.errors.send);
    }
    setSending(false);
    user(D.summary.userSent.replace('{name}', name));
    bot([D.summary.thanks.replace('{name}', name.split(' ')[0] ?? name), { kind: 'summary', rows }], 'done');
  };

  const showChips = !!consent && !typing && options.length > 0 && step !== 'contact';
  const icon = (d: string, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
  const chat = 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z';

  return (
    <>
      {open && (
        <div class="as-panel" role="dialog" aria-label={L.panelAria}>
          <div class="as-head">
            <div class="as-avatar">{icon(chat, 20)}<i /></div>
            <div class="as-head-text"><b>{D.panel.title}</b><small>{D.panel.status}</small></div>
            <button type="button" class="as-icon" aria-label={L.restart} title={L.restart} onClick={restart}>{icon('M3 12a9 9 0 1 0 3-6.7M3 4v5h5')}</button>
            <button type="button" class="as-icon" aria-label={L.close} onClick={() => setOpen(false)}>{icon('M6 6l12 12M18 6L6 18')}</button>
          </div>
          <div class="as-body" ref={body} data-lenis-prevent aria-live="polite">
            <div class="as-banner">{D.panel.banner}</div>
            {!consent && (
              <div class="as-consent-box">
                <b>{D.consent.title}</b>
                {D.consent.body.map((p) => <p>{p}</p>)}
                <p>{D.consent.more} <a href={privacyHref} target="_blank" rel="noopener">{D.consent.privacyLabel}</a>.</p>
                <div class="as-consent-actions">
                  <button type="button" class="as-submit" onClick={() => choose('yes')}>{D.consent.accept}</button>
                  <button type="button" class="as-chip" onClick={() => choose('no')}>{D.consent.decline}</button>
                </div>
              </div>
            )}
            {messages.map((m) => {
              if (m.kind === 'bot') return <div class="as-bot">{m.text}</div>;
              if (m.kind === 'user') return <div class="as-user">{m.text}</div>;
              if (m.kind === 'estimate')
                return (
                  <div class="as-est">
                    <div class="as-est-top">
                      <div class="as-est-row"><span>{D.estimate.title}</span><span class="as-conf">{D.estimate.confidence.replace('{level}', D.estimate.levels[m.est.confidence])}</span></div>
                      <div class="as-range">{m.range}</div>
                      <div class="as-meta">{D.estimate.weeks.replace('{min}', String(m.est.minWeeks)).replace('{max}', String(m.est.maxWeeks))} · {m.label}</div>
                    </div>
                    <div class="as-est-body">
                      <div><b>{D.estimate.upTitle}</b><span>{D.estimate.up}</span></div>
                      <div><b>{D.estimate.downTitle}</b><span>{D.estimate.down}</span></div>
                    </div>
                    <div class="as-warn">{icon('M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 16)}<span>{D.estimate.disclaimer}</span></div>
                  </div>
                );
              if (m.kind !== 'summary') return null;
              return (
                <div class="as-sum">
                  <div class="as-sum-title">{D.summary.title}</div>
                  <div class="as-sum-rows">{m.rows.map((r) => <div><span>{r.k}</span><span>{r.v}</span></div>)}</div>
                  <div class="as-sum-foot">{D.summary.footer}</div>
                </div>
              );
            })}
            {typing && <div class="as-typing"><i /><i /><i /></div>}
            {showChips && <div class="as-chips">{options.map((o) => <button type="button" class="as-chip" onClick={() => pick(o.action, o.label)}>{o.label}</button>)}</div>}
            {!typing && step === 'contact' && (
              <div class="as-form">
                <label>{D.form.name}<input type="text" value={form.name} placeholder={D.form.namePlaceholder} autocomplete="name" onInput={(e) => setForm({ ...form, name: (e.currentTarget as HTMLInputElement).value })} /></label>
                <label>{D.form.email}<input type="email" value={form.email} placeholder={D.form.emailPlaceholder} autocomplete="email" onInput={(e) => setForm({ ...form, email: (e.currentTarget as HTMLInputElement).value })} /></label>
                <label class="as-consent"><input type="checkbox" checked={form.consent} onChange={() => setForm({ ...form, consent: !form.consent })} /><span>{D.form.consent}</span></label>
                {formError && <div class="as-err" role="alert">{formError}</div>}
                <button type="button" class="as-submit" disabled={sending} onClick={() => void submitContact()}>{sending ? D.form.sending : D.form.submit}</button>
              </div>
            )}
          </div>
          <form class="as-input" onSubmit={onSend}>
            <input ref={input} value={draft} disabled={!consent} placeholder={L.inputPlaceholder} aria-label={L.messageAria} onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)} />
            <button type="submit" aria-label={L.send} disabled={!consent}>{icon('M4 12l16-8-6 16-3-7z', 18)}</button>
          </form>
          <div class="as-foot">{D.panel.disclaimer}</div>
        </div>
      )}
      {!open && (
        <button type="button" class="as-fab" aria-label={L.fabAria} onClick={toggle}>
          <span class="as-fab-ico">{icon(chat, 20)}<i /></span>
          <span class="as-fab-text"><b>{L.fabTitle}</b><small>{L.fabSubtitle}</small></span>
        </button>
      )}
      <button type="button" class={`as-fab-mini${open ? ' open' : ''}`} aria-label={open ? L.close : L.fabAria} onClick={toggle}>{icon(open ? 'M6 6l12 12M18 6L6 18' : chat, 22)}</button>
    </>
  );
}
