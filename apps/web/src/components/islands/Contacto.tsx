import { useEffect, useRef, useState } from 'preact/hooks';
import { contactLimits as LIM } from '@rr/shared';
import { sendContact } from '../../lib/assistant/api';
import Eyebrow from './Eyebrow';
import LogoMark from './LogoMark';
import './Contacto.css';

type Mode = 'guided' | 'direct';
type Status = 'idle' | 'sending' | 'error' | 'sent';
interface Goal { title: string; description: string; routeTitle: string; routeText: string }
interface Step { title: string; text: string }
interface Labels {
  eyebrow: string; title1: string; title2: string; lead: string; howToTell: string;
  modes: Record<Mode, { title: string; description: string }>;
  steps: Record<'goal' | 'context' | 'jam' | 'contact', string>;
  direct: { title: string; lead: string; send: string };
  fields: Record<'name' | 'email' | 'workEmail' | 'company' | 'optional' | 'message' | 'phone' | 'tools' | 'team' | 'when' | 'howContinue', string>;
  placeholders: Record<'name' | 'email' | 'company' | 'messageDirect' | 'messageGuided' | 'phone' | 'otherTool', string>;
  consent: string;
  errors: Record<'name' | 'emailInvalid' | 'messageShort' | 'consent' | 'goal' | 'jamShort' | 'phone' | 'phoneInvalid' | 'tools' | 'send', string>;
  q1: { counter: string; title: string; hint: string }; q2: { counter: string; title: string; toolsHint: string };
  q3: { counter: string; title: string; hint: string; enough: string; notEnough: string; examplesTitle: string; examples: Record<string, string> };
  q4: { counter: string; title: string };
  goals: Record<string, Goal>; sizes: Record<string, string>; whens: Record<string, string>; tools: Record<string, string>; prefs: Record<'email' | 'call', string>;
  nav: Record<'back' | 'next' | 'submit' | 'sending' | 'keysHint' | 'ctrlEnter', string>;
  sheet: { title: string; forPrefix: string; defaultName: string; status: Record<'blank' | 'forming' | 'sent', string>; whereStart: string; fillHint: string; team: string; teamValue: string; when: string; tools: string; jamTitle: string; jamEmpty: string; empty: string };
  sent: { title: string; callLine: string; mailLine: string; inOneDay: string; another: string;
    guided: { s1: Step; s2Mail: Step; s2Call: Step; s3: Step }; direct: { s1: Step; s2: Step; s3: Step } };
  aside: { reviewer: string; reviewerText: string; preferWrite: string; location: string };
}
interface Props { labels: Labels; lang: string; email: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s().-]+$/;
const parseTools = (s: string) => [...new Set(s.split(',').map((x) => x.trim()).filter(Boolean))];
type ErrCode = keyof Labels['errors'];
const BLANK = { goals: [] as string[], size: '', when: '', tools: [] as string[], toolsOther: '', msg: '', name: '', company: '', email: '', pref: 0, phone: '', consent: false };

export default function Contacto({ labels: L, lang, email: contactEmail }: Props) {
  const [mode, setMode] = useState<Mode>('guided');
  const [step, setStep] = useState(0);
  const [f, setF] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, ErrCode | ''>>({});
  const [stepErr, setStepErr] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const started = useRef(Date.now());
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<typeof BLANK>) => setF((v) => ({ ...v, ...patch }));
  const goalIds = Object.keys(L.goals);
  const stepIds = ['goal', 'context', 'jam', 'contact'] as const;

  useEffect(() => {
    const r = step === 2 ? msgRef : step === 3 ? nameRef : null;
    if (r) setTimeout(() => r.current?.focus({ preventScroll: true }), 60);
  }, [step]);

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // Un único sitio con las reglas de cada campo; los límites salen del esquema compartido con la API.
  const check = (key: string, v = f, m: Mode = mode): ErrCode | '' => {
    switch (key) {
      case 'name': return v.name.trim() ? '' : 'name';
      case 'email': { const t = v.email.trim(); return EMAIL_RE.test(t) && t.length <= LIM.email ? '' : 'emailInvalid'; }
      case 'phone': {
        if (v.pref !== 1) return '';
        const t = v.phone.trim();
        if (!t) return 'phone';
        const digits = t.replace(/\D/g, '').length;
        return PHONE_RE.test(t) && digits >= LIM.phoneDigitsMin && digits <= LIM.phoneDigitsMax ? '' : 'phoneInvalid';
      }
      case 'msg': { const n = v.msg.trim().length; return n >= (m === 'guided' ? LIM.messageGuidedMin : LIM.messageMin) ? '' : m === 'guided' ? 'jamShort' : 'messageShort'; }
      case 'tools': { const other = parseTools(v.toolsOther); return v.tools.length + other.length <= LIM.tools && other.every((x) => x.length <= LIM.tool) ? '' : 'tools'; }
      case 'consent': return v.consent ? '' : 'consent';
    }
    return '';
  };
  const collect = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, check(k)] as const).filter(([, c]) => c)) as Record<string, ErrCode>;
  /** Validación en vivo: al salir de un campo se avisa; mientras hay aviso, se quita en cuanto el valor es válido. */
  const live = (key: string, next = f) => setErrors((e) => ({ ...e, [key]: check(key, next) }));

  const validateStep = (s: number) => {
    if (s === 0 && !f.goals.length) return { stepErr: L.errors.goal, errors: {} };
    const keys = s === 1 ? ['tools'] : s === 2 ? ['msg'] : s === 3 ? ['name', 'email', 'phone', 'consent'] : [];
    const e = collect(keys);
    return Object.keys(e).length ? { stepErr: '', errors: e } : null;
  };

  const submit = async () => {
    setStatus('sending');
    try {
      await sendContact({
        startedAt: started.current,
        lang: lang === 'en' ? 'en' : 'es',
        mode,
        goals: f.goals,
        size: f.size,
        when: f.when,
        tools: [...new Set([...f.tools, ...parseTools(f.toolsOther)])],
        message: f.msg.trim(),
        name: f.name.trim(),
        company: f.company.trim(),
        email: f.email.trim(),
        preference: f.pref === 1 ? 'call' : 'email',
        phone: f.pref === 1 ? f.phone.trim() : '',
        consent: true,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const next = (e?: Event) => {
    e?.preventDefault();
    if (status === 'sending') return;
    const err = validateStep(step);
    if (err) {
      setErrors(err.errors);
      setStepErr(err.stepErr);
      return;
    }
    setErrors({});
    setStepErr('');
    if (step < 3) setStep(step + 1);
    else void submit();
  };
  const sendDirect = (e: Event) => {
    e.preventDefault();
    if (status === 'sending') return;
    const err = collect(['name', 'email', 'msg', 'consent']);
    setErrors(err);
    if (Object.keys(err).length) return;
    void submit();
  };
  const onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      mode === 'guided' ? next() : sendDirect(e);
      return;
    }
    if (tag === 'INPUT' || tag === 'TEXTAREA' || mode !== 'guided') return;
    if (step === 0 && /^[1-6]$/.test(e.key)) {
      e.preventDefault();
      const id = goalIds[+e.key - 1];
      if (id) { set({ goals: toggle(f.goals, id) }); setStepErr(''); }
    }
  };
  const reset = () => { setF(BLANK); setStep(0); setErrors({}); setStepErr(''); setStatus('idle'); };

  const sent = status === 'sent';
  const len = f.msg.trim().length;
  const toolTags = [...f.tools.map((k) => L.tools[k]!), ...parseTools(f.toolsOther)];
  const chosen = f.goals.map((id) => L.goals[id]!).filter(Boolean);
  const filled = f.goals.length || f.size || f.when || toolTags.length || len;
  const head = [f.name.trim().split(' ')[0], f.company.trim()].filter(Boolean);
  const first = f.name.trim().split(' ')[0] ?? '';
  const q = f.msg.trim();

  const input = (key: 'name' | 'email' | 'company' | 'phone', label: string, type: string, ph: string, ac: string, ref?: any, opt = false) => {
    const code = errors[key] || '';
    const max = { name: LIM.name, email: LIM.email, company: LIM.company, phone: LIM.phone }[key];
    return (
      <label class="ct-field">
        <span>{label} {opt && <em>{L.fields.optional}</em>}</span>
        <input
          ref={ref} class={`ct-input${code ? ' err' : ''}`} type={type as 'text'} value={f[key]} placeholder={ph} autocomplete={ac} maxLength={max}
          inputMode={key === 'email' ? 'email' : key === 'phone' ? 'tel' : undefined} required={!opt} aria-required={!opt} aria-invalid={!!code} aria-describedby={code ? `err-${key}` : undefined}
          onInput={(e) => { const v = (e.currentTarget as HTMLInputElement).value; set({ [key]: v } as any); if (code) live(key, { ...f, [key]: v }); }}
          onBlur={() => !opt || f[key] ? live(key) : undefined}
        />
        {code && <span class="ct-err" id={`err-${key}`} role="alert">{L.errors[code]}</span>}
      </label>
    );
  };
  const consent = (
    <>
      <label class="ct-consent">
        <input type="checkbox" checked={f.consent} required aria-required="true" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'err-consent' : undefined} onChange={() => { const consent = !f.consent; set({ consent }); if (errors.consent) live('consent', { ...f, consent }); }} />
        <span>{L.consent}</span>
      </label>
      {errors.consent && <span class="ct-err" id="err-consent" role="alert" style="margin-top:-10px">{L.errors.consent}</span>}
    </>
  );
  const chips = (map: Record<string, string>, selected: (k: string) => boolean, pick: (k: string) => void, small = false) => (
    <div class="ct-chips">
      {Object.entries(map).map(([k, v]) => <button type="button" class={`ct-chip${small ? ' sm' : ''}${selected(k) ? ' on' : ''}`} aria-pressed={selected(k)} onClick={() => pick(k)}>{v}</button>)}
    </div>
  );

  const sentSteps = mode === 'direct'
    ? [L.sent.direct.s1, L.sent.direct.s2, L.sent.direct.s3]
    : [L.sent.guided.s1, f.pref === 1 ? L.sent.guided.s2Call : L.sent.guided.s2Mail, L.sent.guided.s3];

  return (
    <section id="contacto" class="ct">
      <div class="ct-inner" data-reveal>
        <Eyebrow text={L.eyebrow} dark />
        <div class="ct-head">
          <h2 class="ct-title">{L.title1} <span>{L.title2}</span></h2>
          <p class="ct-lead">{L.lead}</p>
        </div>
        <div class="ct-grid">
          <div class="ct-card">
            {!sent && (
              <div class="ct-modebar">
                <span>{L.howToTell}</span>
                <div class="ct-tabs" role="tablist">
                  {(['guided', 'direct'] as const).map((m) => (
                    <button type="button" role="tab" aria-selected={mode === m} class={`ct-tab${mode === m ? ' on' : ''}`} onClick={() => { setMode(m); setErrors({}); setStepErr(''); setStatus('idle'); }}>
                      <b>{L.modes[m].title}</b><small>{L.modes[m].description}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mode === 'guided' && (
              <div class="ct-steps">
                {stepIds.map((id, i) => {
                  const cur = i === step && !sent, past = i < step || sent;
                  return (
                    <button type="button" class={`ct-step${cur ? ' cur' : past ? ' past' : ''}`} aria-current={cur ? 'step' : undefined} onClick={() => { if (i < step && !sent) { setStep(i); setErrors({}); setStepErr(''); } }}>
                      <small>{past ? `✓ 0${i + 1}` : `0${i + 1}`}</small><b>{L.steps[id]}</b>
                      <i style={`width:${past ? 100 : cur ? 35 : 0}%`} />
                    </button>
                  );
                })}
              </div>
            )}

            {sent ? (
              <div class="ct-sent" role="status">
                <h3>{L.sent.title.replace('{name}', first)}</h3>
                <p>{mode === 'guided' && f.pref === 1 ? L.sent.callLine : L.sent.mailLine} <b>{mode === 'guided' && f.pref === 1 ? f.phone : f.email}</b> {L.sent.inOneDay}</p>
                <ol class="ct-next-steps">{sentSteps.map((s, i) => <li><span class="n">{i + 1}</span><div><b>{s.title}</b><small>{s.text}</small></div></li>)}</ol>
                <button type="button" class="ct-again" onClick={reset}>{L.sent.another}</button>
              </div>
            ) : mode === 'direct' ? (
              <form class="ct-form" noValidate onSubmit={sendDirect} onKeyDown={onKey}>
                <div class="ct-body">
                  <div><h3 class="ct-h" style="margin:0">{L.direct.title}</h3><p class="ct-sub">{L.direct.lead}</p></div>
                  <div class="ct-two">
                    {input('name', L.fields.name, 'text', L.placeholders.name, 'name', undefined, false)}
                    {input('email', L.fields.email, 'email', L.placeholders.email, 'email', undefined, false)}
                  </div>
                  {input('company', L.fields.company, 'text', L.placeholders.company, 'organization', undefined, true)}
                  <label class="ct-field">
                    <span>{L.fields.message}</span>
                    <textarea class={`ct-text${errors.msg ? ' err' : ''}`} rows={5} value={f.msg} placeholder={L.placeholders.messageDirect} maxLength={LIM.message} required aria-required="true" aria-invalid={!!errors.msg} aria-describedby={errors.msg ? 'err-msg' : undefined}
                      onInput={(e) => { const msg = (e.currentTarget as HTMLTextAreaElement).value; set({ msg }); if (errors.msg) live('msg', { ...f, msg }); }} onBlur={() => live('msg')} />
                    {errors.msg && <span class="ct-err" id="err-msg" role="alert">{L.errors[errors.msg]}</span>}
                    {f.msg.length >= LIM.message * 0.8 && <span class="ct-count">{f.msg.length} / {LIM.message}</span>}
                  </label>
                  {consent}
                  {status === 'error' && <span class="ct-err" role="alert">{L.errors.send.replace('{email}', contactEmail)}</span>}
                </div>
                <div class="ct-foot" style="justify-content:flex-end">
                  <button type="submit" class="ct-next" disabled={status === 'sending'}>{status === 'sending' ? L.nav.sending : L.direct.send} <span>→</span></button>
                </div>
              </form>
            ) : (
              <form class="ct-form" noValidate onSubmit={next} onKeyDown={onKey}>
                <div class="ct-body" key={step}>
                  {step === 0 && (
                    <>
                      <div><span class="ct-q">{L.q1.counter}</span><h3 class="ct-h">{L.q1.title}</h3><p class="ct-sub">{L.q1.hint}</p></div>
                      <div class="ct-goals">
                        {goalIds.map((id, i) => {
                          const on = f.goals.includes(id);
                          return (
                            <button type="button" class={`ct-goal${on ? ' on' : ''}`} aria-pressed={on} onClick={() => { set({ goals: toggle(f.goals, id) }); setStepErr(''); }}>
                              <span class="ct-key">{on ? '✓' : i + 1}</span>
                              <span><b>{L.goals[id]!.title}</b><small>{L.goals[id]!.description}</small></span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div><span class="ct-q">{L.q2.counter}</span><h3 class="ct-h">{L.q2.title}</h3></div>
                      <div class="ct-group"><span>{L.fields.team}</span>{chips(L.sizes, (k) => f.size === k, (k) => set({ size: k }))}</div>
                      <div class="ct-group"><span>{L.fields.when}</span>{chips(L.whens, (k) => f.when === k, (k) => set({ when: k }))}</div>
                      <div class="ct-group">
                        <span>{L.fields.tools} <em>{L.fields.optional}</em></span>
                        {chips(L.tools, (k) => f.tools.includes(k), (k) => set({ tools: toggle(f.tools, k) }), true)}
                        <input class={`ct-input${errors.tools ? ' err' : ''}`} type="text" value={f.toolsOther} placeholder={L.placeholders.otherTool} aria-label={L.fields.tools} maxLength={600} aria-invalid={!!errors.tools} aria-describedby={errors.tools ? 'err-tools' : 'hint-tools'}
                          onInput={(e) => { const toolsOther = (e.currentTarget as HTMLInputElement).value; set({ toolsOther }); if (errors.tools) live('tools', { ...f, toolsOther }); }} onBlur={() => live('tools')} />
                        {errors.tools ? <span class="ct-err" id="err-tools" role="alert">{L.errors.tools}</span> : <small class="ct-help" id="hint-tools">{L.q2.toolsHint}</small>}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div><span class="ct-q">{L.q3.counter}</span><h3 class="ct-h">{L.q3.title}</h3><p class="ct-sub">{L.q3.hint}</p></div>
                      <div class="ct-field">
                        <textarea ref={msgRef} class={`ct-text${errors.msg ? ' err' : ''}`} rows={6} value={f.msg} placeholder={L.placeholders.messageGuided} aria-label={L.q3.title} maxLength={LIM.message} required aria-required="true" aria-invalid={!!errors.msg} aria-describedby={errors.msg ? 'err-msg' : undefined}
                          onInput={(e) => { const msg = (e.currentTarget as HTMLTextAreaElement).value; set({ msg }); setStepErr(''); if (errors.msg) live('msg', { ...f, msg }); }} onBlur={() => f.msg && live('msg')} />
                        {errors.msg && <span class="ct-err" id="err-msg" role="alert">{L.errors[errors.msg]}</span>}
                        {f.msg.length >= LIM.message * 0.8 && <span class="ct-count">{f.msg.length} / {LIM.message}</span>}
                        <div class="ct-meter"><i style={`width:${Math.min(100, (len / 20) * 100)}%;background:${len >= 20 ? 'var(--color-ok-strong)' : 'var(--color-primary-on-dark)'}`} /></div>
                        <span style={`font-size: var(--font-size-small);color:${len >= 20 ? 'var(--color-ok-soft)' : 'var(--color-dark-text-subtle)'}`}>{len >= 20 ? L.q3.enough : L.q3.notEnough}</span>
                      </div>
                      <div class="ct-examples">
                        <span>{L.q3.examplesTitle}</span>
                        {Object.values(L.q3.examples).map((x) => <button type="button" class="ct-ex" onClick={() => { set({ msg: `${x} ` }); setStepErr(''); setErrors((e) => ({ ...e, msg: '' })); }}>{x}</button>)}
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div><span class="ct-q">{L.q4.counter}</span><h3 class="ct-h">{L.q4.title}</h3></div>
                      <div class="ct-two">
                        {input('name', L.fields.name, 'text', L.placeholders.name, 'name', nameRef, false)}
                        {input('company', L.fields.company, 'text', L.placeholders.company, 'organization', undefined, true)}
                      </div>
                      {input('email', L.fields.workEmail, 'email', L.placeholders.email, 'email', undefined, false)}
                      <div class="ct-group"><span>{L.fields.howContinue}</span>{chips(L.prefs, (k) => (f.pref === 1) === (k === 'call'), (k) => set({ pref: k === 'call' ? 1 : 0 }))}</div>
                      {f.pref === 1 && input('phone', L.fields.phone, 'tel', L.placeholders.phone, 'tel', undefined, false)}
                      {consent}
                      {status === 'error' && <span class="ct-err" role="alert">{L.errors.send.replace('{email}', contactEmail)}</span>}
                    </>
                  )}
                </div>
                <div class="ct-foot">
                  <button type="button" class="ct-back" style={`visibility:${step ? 'visible' : 'hidden'}`} onClick={() => { setStep(Math.max(0, step - 1)); setErrors({}); setStepErr(''); }}>{L.nav.back}</button>
                  <span class={`ct-hint${stepErr ? ' err' : ''}`} role={stepErr ? 'alert' : undefined}>{stepErr || (step === 0 ? L.nav.keysHint : step === 2 ? L.nav.ctrlEnter : '')}</span>
                  <button type="submit" class="ct-next" disabled={status === 'sending'}>{status === 'sending' ? L.nav.sending : step === 3 ? L.nav.submit : L.nav.next} <span>→</span></button>
                </div>
              </form>
            )}
          </div>

          <div class="ct-side">
            <div class="ct-sheet" aria-live="polite">
              <div class="ct-sheet-top">
                <div><small>{L.sheet.title}</small><b>{head.length ? L.sheet.forPrefix.replace('{names}', head.join(' · ')) : L.sheet.defaultName}</b></div>
                <span class={`ct-state${sent ? ' sent' : filled ? ' forming' : ''}`}>{sent ? L.sheet.status.sent : filled ? L.sheet.status.forming : L.sheet.status.blank}</span>
              </div>
              <div>
                <p class="ct-h5">{L.sheet.whereStart}</p>
                {chosen.length ? <ol class="ct-route">{chosen.map((g, i) => <li><span>{i + 1}</span><span><b>{g.routeTitle}</b><small>{g.routeText}</small></span></li>)}</ol> : <p class="ct-empty">{L.sheet.fillHint}</p>}
              </div>
              <div class="ct-facts">
                <div><p class="ct-h5">{L.sheet.team}</p><b style={`color:${f.size ? 'inherit' : 'var(--color-foreground-subtle)'}`}>{f.size ? L.sheet.teamValue.replace('{size}', L.sizes[f.size]!) : L.sheet.empty}</b></div>
                <div><p class="ct-h5">{L.sheet.when}</p><b style={`color:${f.when ? 'inherit' : 'var(--color-foreground-subtle)'}`}>{f.when ? L.whens[f.when] : L.sheet.empty}</b></div>
              </div>
              <div><p class="ct-h5">{L.sheet.tools}</p>{toolTags.length ? <div class="ct-tags">{toolTags.map((x) => <span>{x}</span>)}</div> : <span class="ct-empty">{L.sheet.empty}</span>}</div>
              <div><p class="ct-h5">{L.sheet.jamTitle}</p><p class="ct-quote" tabIndex={0} style={`font-style:${q ? 'italic' : 'normal'};color:${q ? 'inherit' : 'var(--color-foreground-subtle)'}`}>{q ? `«${q}»` : L.sheet.jamEmpty}</p></div>
              <div class="ct-by"><span class="ct-by-mark"><LogoMark size={28} /></span><div><b>{L.aside.reviewer}</b><small>{L.aside.reviewerText}</small></div></div>
            </div>
            <div class="ct-mail"><span>{L.aside.preferWrite}</span><a href={`mailto:${contactEmail}`}>{contactEmail}</a><span>{L.aside.location}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
