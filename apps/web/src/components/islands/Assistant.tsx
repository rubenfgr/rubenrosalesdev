import { useEffect, useRef, useState } from 'preact/hooks';
import { hasPersonalData, matchRule, type Ctx } from '@rr/shared/engine';
import { LlmUnavailable, sendLead, streamChat } from '../../lib/assistant/api';
import { summaryLines } from '../../lib/assistant/summary';
import LogoMark from './LogoMark';
import './Assistant.css';

interface Data {
  consent: { title: string; body: string[]; more: string; privacyLabel: string; accept: string; decline: string };
  panel: { title: string; status: string; banner: string; disclaimer: string };
  greeting: string[];
  steps: Record<string, { action: string; label: string }[]>;
  actions: Record<string, { say: string[]; step: string }>;
  rules: { pattern: string; action: string }[];
  types: Record<string, string>; systems: Record<string, string>; team: Record<string, string>;
  form: { name: string; namePlaceholder: string; email: string; emailPlaceholder: string; consent: string; submit: string; sending: string; errors: Record<'name' | 'email' | 'consent' | 'send', string> };
  summary: { title: string; rows: Record<'name' | 'email' | 'project' | 'tools' | 'team' | 'chat', string>; footer: string; thanks: string; userSent: string };
}
interface Labels { fabAria: string; panelAria: string; close: string; restart: string; send: string; messageAria: string; inputPlaceholder: string; fabTitle: string; fabSubtitle: string; retry: string }
interface Props { data: Data; labels: Labels; lang: string; privacyHref: string; llm?: boolean }

type Msg =
  | { kind: 'bot' | 'user'; text: string }
  | { kind: 'summary'; rows: { k: string; v: string }[] };
// La elección del aviso se recuerda solo durante la sesión de la pestaña (sobrevive al refresco, no a cerrarla).
const CONSENT_KEY = 'rr-assistant-consent';
const readConsent = (): 'yes' | 'no' | null => {
  try {
    const v = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(CONSENT_KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null; // almacenamiento bloqueado: se vuelve a preguntar
  }
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Assistant({ data: D, labels: L, lang, privacyHref, llm = false }: Props) {
  const [open, setOpen] = useState(false);
  // Aviso de privacidad (D-4): hasta elegir, no se muestra el chat ni se envía nada. 'yes' = guardar la conversación.
  const [consent, setConsent] = useState<'yes' | 'no' | null>(readConsent);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState('start');
  const [draft, setDraft] = useState('');
  const [ctx, setCtx] = useState<Ctx>({});
  const [form, setForm] = useState({ name: '', email: '', consent: false });
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  // Texto libre pendiente de reintentar con el LLM (tras un fallo).
  const [retry, setRetry] = useState<string | null>(null);
  const conversationId = useRef<string | undefined>(undefined);
  const abort = useRef<AbortController | null>(null);
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
  // Con el panel abierto se bloquea el scroll de la página y, en móvil, el panel sigue al viewport visual
  // (el teclado lo recorta; así el campo de texto y la cabecera del panel siguen a la vista).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('as-lock');
    const vv = window.visualViewport;
    const sync = () => {
      if (!vv) return;
      root.style.setProperty('--as-vh', `${vv.height}px`);
      root.style.setProperty('--as-vt', `${vv.offsetTop}px`);
    };
    sync();
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    return () => {
      root.classList.remove('as-lock');
      root.style.removeProperty('--as-vh');
      root.style.removeProperty('--as-vt');
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
    };
  }, [open]);
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
  }, [messages.length, typing, step]);
  useEffect(() => () => { clearTimeout(timer.current); abort.current?.abort(); }, []);

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
    try {
      sessionStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* sin almacenamiento: no se recuerda */
    }
    bot(D.greeting, 'start');
  };
  const restart = () => {
    if (!consent) return;
    clearTimeout(timer.current);
    abort.current?.abort();
    conversationId.current = undefined;
    setRetry(null);
    setMessages([]);
    setCtx({});
    setTyping(false);
    setStep('start');
    setFormError('');
    setTimeout(() => bot(D.greeting, 'start'), 0);
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
      return say('briefDone');
    }
    if (action === 'proyecto') setCtx({});
    say(action);
  };

  const options: { action: string; label: string }[] =
    step === 'type' ? Object.entries(D.types).map(([a, l]) => ({ action: a, label: l }))
    : step === 'systems' ? Object.entries(D.systems).map(([a, l]) => ({ action: a, label: l }))
    : step === 'team' ? Object.entries(D.team).map(([a, l]) => ({ action: a, label: l }))
    : D.steps[step] ?? [];

  /** Texto libre al LLM con streaming. Si la API no está disponible, se responde con el motor de reglas (comportamiento previo). */
  const askLlm = async (text: string) => {
    setRetry(null);
    setTyping(true);
    setStep('wait');
    const ac = new AbortController();
    abort.current = ac;
    const history = messages
      .flatMap((m) => (m.kind === 'bot' || m.kind === 'user' ? [{ role: m.kind === 'user' ? ('user' as const) : ('assistant' as const), content: m.text.slice(0, 2000) }] : []))
      .slice(-19);
    let acc = '';
    let started = false;
    try {
      const done = await streamChat(
        {
          lang: lang === 'en' ? 'en' : 'es',
          ...(conversationId.current ? { conversationId: conversationId.current } : {}),
          messages: [...history, { role: 'user', content: text.slice(0, 2000) }],
          consent: consent === 'yes',
        },
        (t) => {
          acc += t;
          const snapshot = acc;
          const first = !started;
          started = true;
          setTyping(false);
          setMessages((m) => (first ? [...m, { kind: 'bot', text: snapshot }] : [...m.slice(0, -1), { kind: 'bot', text: snapshot }]));
        },
        { signal: ac.signal },
      );
      if (consent === 'yes') conversationId.current = done.conversationId;
      setTyping(false);
      setStep('after_chat');
    } catch (err) {
      if (ac.signal.aborted) return;
      setTyping(false);
      setRetry(text);
      if (started || !(err instanceof LlmUnavailable)) return setStep('after_chat');
      say(matchRule(D.rules, text) ?? 'fallback');
    }
  };

  const onSend = (e: Event) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || typing) return;
    setDraft('');
    user(t);
    // Correo o teléfono: no van al modelo; se abre el formulario (que sí los envía a Rubén).
    if (hasPersonalData(t)) return say('personalData');
    // Reglas primero (como en la API): lo que ya tiene guion no gasta una llamada al modelo.
    const rule = matchRule(D.rules, t);
    if (rule) return say(rule);
    if (llm && consent) void askLlm(t);
    else say('fallback');
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
    // Lo que el visitante ha escrito con sus palabras (no los botones), para que Rubén tenga el contexto.
    const typed = messages.flatMap((m) => (m.kind === 'user' && !chipLabels.has(m.text) ? [m.text] : []));
    const details = rows.slice(2); // sin nombre ni correo: el email ya los lleva en la cabecera
    const lines = summaryLines(details, typed, D.summary.rows.chat);
    if (typed.length) rows.push({ k: D.summary.rows.chat, v: typed.slice(-6).map((t) => t.slice(0, 250)).join(' · ') });
    setFormError('');
    setSending(true);
    try {
      await sendLead({
        startedAt: started.current,
        lang: lang === 'en' ? 'en' : 'es',
        name,
        email: form.email.trim(),
        consent: true,
        summary: lines,
        ...(conversationId.current ? { conversationId: conversationId.current } : {}),
      });
    } catch {
      setSending(false);
      return setFormError(D.form.errors.send);
    }
    setSending(false);
    user(D.summary.userSent.replace('{name}', name));
    bot([D.summary.thanks.replace('{name}', name.split(' ')[0] ?? name), { kind: 'summary', rows }], 'done');
  };

  const chipLabels = new Set(Object.values(D.steps).flatMap((list) => list.map((o) => o.label)).concat(Object.values(D.types), Object.values(D.systems), Object.values(D.team)));
  const showChips = !!consent && !typing && options.length > 0 && step !== 'contact';
  const icon = (d: string, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={d} /></svg>
  );

  return (
    <>
      {open && (
        <div class="as-panel" role="dialog" aria-label={L.panelAria}>
          <div class="as-head">
            <div class="as-avatar"><LogoMark tone="dark" size={24} /><i /></div>
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
            {!!consent && retry && !typing && step === 'start' && <div class="as-chips"><button type="button" class="as-chip" onClick={() => void askLlm(retry)}>{L.retry}</button></div>}
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
        <button type="button" class={`as-fab`} aria-label={L.fabAria} onClick={toggle}>
          <span class="as-fab-ico"><LogoMark tone="dark" size={24} /></span>
          <span class="as-fab-text"><b>{L.fabTitle}</b><small>{L.fabSubtitle}</small></span>
        </button>
      )}
      <button type="button" class={`as-fab-mini${open ? ' open' : ''}`} aria-label={open ? L.close : L.fabAria} onClick={toggle}>{open ? icon('M6 6l12 12M18 6L6 18', 22) : <LogoMark tone="dark" size={28} />}</button>
    </>
  );
}
