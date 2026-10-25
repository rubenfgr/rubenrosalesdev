import { useEffect, useRef, useState } from 'preact/hooks';
import { sendContact } from '../../lib/assistant/api';
import Eyebrow from './Eyebrow';
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
  errors: Record<'name' | 'emailInvalid' | 'messageShort' | 'consent' | 'goal' | 'jamShort' | 'phone' | 'send', string>;
  q1: { counter: string; title: string; hint: string }; q2: { counter: string; title: string };
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
const BLANK = { goals: [] as string[], size: '', when: '', tools: [] as string[], toolsOther: '', msg: '', name: '', company: '', email: '', pref: 0, phone: '', consent: false };

export default function Contacto({ labels: L, lang, email: contactEmail }: Props) {
  const [mode, setMode] = useState<Mode>('guided');
  const [step, setStep] = useState(0);
  const [f, setF] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
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

  const validateStep = (s: number) => {
    if (s === 0 && !f.goals.length) return { stepErr: L.errors.goal, errors: {} };
    if (s === 2 && f.msg.trim().length < 20) return { stepErr: L.errors.jamShort, errors: { msg: true } };
    if (s === 3) {
      const e = { name: !f.name.trim(), email: !EMAIL_RE.test(f.email), phone: f.pref === 1 && f.phone.replace(/\D/g, '').length < 9, consent: !f.consent };
      if (Object.values(e).some(Boolean)) return { stepErr: '', errors: e };
    }
    return null;
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
        tools: [...f.tools, ...f.toolsOther.split(',').map((x) => x.trim()).filter(Boolean)],
        message: f.msg,
        name: f.name,
        company: f.company,
        email: f.email,
        preference: f.pref === 1 ? 'call' : 'email',
        phone: f.phone,
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
    const err = { name: !f.name.trim(), email: !EMAIL_RE.test(f.email), msg: f.msg.trim().length < 10, consent: !f.consent };
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;
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
  const toolTags = [...f.tools.map((k) => L.tools[k]!), ...f.toolsOther.split(',').map((x) => x.trim()).filter(Boolean)];
  const chosen = f.goals.map((id) => L.goals[id]!).filter(Boolean);
  const filled = f.goals.length || f.size || f.when || toolTags.length || len;
  const head = [f.name.trim().split(' ')[0], f.company.trim()].filter(Boolean);
  const first = f.name.trim().split(' ')[0] ?? '';
  const q = f.msg.trim();

  const input = (key: 'name' | 'email' | 'company' | 'phone', label: string, type: string, ph: string, ac: string, ref?: any, opt = false, errMsg?: string) => (
    <label class="ct-field">
      <span>{label} {opt && <em>{L.fields.optional}</em>}</span>
      <input ref={ref} class={`ct-input${errors[key] ? ' err' : ''}`} type={type as 'text'} value={f[key]} placeholder={ph} autocomplete={ac} onInput={(e) => set({ [key]: (e.currentTarget as HTMLInputElement).value } as any)} />
      {errors[key] && errMsg && <span class="ct-err" role="alert">{errMsg}</span>}
    </label>
  );
  const consent = (
    <>
      <label class="ct-consent">
        <input type="checkbox" checked={f.consent} onChange={() => set({ consent: !f.consent })} />
        <span>{L.consent}</span>
      </label>
      {errors.consent && <span class="ct-err" role="alert" style="margin-top:-10px">{L.errors.consent}</span>}
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
                    {input('name', L.fields.name, 'text', L.placeholders.name, 'name', undefined, false, L.errors.name)}
                    {input('email', L.fields.email, 'email', L.placeholders.email, 'email', undefined, false, L.errors.emailInvalid)}
                  </div>
                  {input('company', L.fields.company, 'text', L.placeholders.company, 'organization', undefined, true)}
                  <label class="ct-field">
                    <span>{L.fields.message}</span>
                    <textarea class={`ct-text${errors.msg ? ' err' : ''}`} rows={5} value={f.msg} placeholder={L.placeholders.messageDirect} onInput={(e) => set({ msg: (e.currentTarget as HTMLTextAreaElement).value })} />
                    {errors.msg && <span class="ct-err" role="alert">{L.errors.messageShort}</span>}
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
                        <input class="ct-input" type="text" value={f.toolsOther} placeholder={L.placeholders.otherTool} aria-label={L.fields.tools} onInput={(e) => set({ toolsOther: (e.currentTarget as HTMLInputElement).value })} />
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div><span class="ct-q">{L.q3.counter}</span><h3 class="ct-h">{L.q3.title}</h3><p class="ct-sub">{L.q3.hint}</p></div>
                      <div class="ct-field">
                        <textarea ref={msgRef} class={`ct-text${errors.msg ? ' err' : ''}`} rows={6} value={f.msg} placeholder={L.placeholders.messageGuided} aria-label={L.q3.title}
                          onInput={(e) => { set({ msg: (e.currentTarget as HTMLTextAreaElement).value }); setStepErr(''); setErrors({}); }} />
                        <div class="ct-meter"><i style={`width:${Math.min(100, (len / 20) * 100)}%;background:${len >= 20 ? 'var(--color-ok-strong)' : 'var(--color-primary-on-dark)'}`} /></div>
                        <span style={`font-size:13px;color:${len >= 20 ? 'var(--color-ok-soft)' : 'var(--color-dark-text-subtle)'}`}>{len >= 20 ? L.q3.enough : L.q3.notEnough}</span>
                      </div>
                      <div class="ct-examples">
                        <span>{L.q3.examplesTitle}</span>
                        {Object.values(L.q3.examples).map((x) => <button type="button" class="ct-ex" onClick={() => { set({ msg: `${x} ` }); setStepErr(''); setErrors({}); }}>{x}</button>)}
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div><span class="ct-q">{L.q4.counter}</span><h3 class="ct-h">{L.q4.title}</h3></div>
                      <div class="ct-two">
                        {input('name', L.fields.name, 'text', L.placeholders.name, 'name', nameRef, false, L.errors.name)}
                        {input('company', L.fields.company, 'text', L.placeholders.company, 'organization', undefined, true)}
                      </div>
                      {input('email', L.fields.workEmail, 'email', L.placeholders.email, 'email', undefined, false, L.errors.emailInvalid)}
                      <div class="ct-group"><span>{L.fields.howContinue}</span>{chips(L.prefs, (k) => (f.pref === 1) === (k === 'call'), (k) => set({ pref: k === 'call' ? 1 : 0 }))}</div>
                      {f.pref === 1 && input('phone', L.fields.phone, 'tel', L.placeholders.phone, 'tel', undefined, false, L.errors.phone)}
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
                <h5>{L.sheet.whereStart}</h5>
                {chosen.length ? <ol class="ct-route">{chosen.map((g, i) => <li><span>{i + 1}</span><span><b>{g.routeTitle}</b><small>{g.routeText}</small></span></li>)}</ol> : <p class="ct-empty">{L.sheet.fillHint}</p>}
              </div>
              <div class="ct-facts">
                <div><h5>{L.sheet.team}</h5><b style={`color:${f.size ? 'inherit' : 'var(--color-foreground-faint)'}`}>{f.size ? L.sheet.teamValue.replace('{size}', L.sizes[f.size]!) : L.sheet.empty}</b></div>
                <div><h5>{L.sheet.when}</h5><b style={`color:${f.when ? 'inherit' : 'var(--color-foreground-faint)'}`}>{f.when ? L.whens[f.when] : L.sheet.empty}</b></div>
              </div>
              <div><h5>{L.sheet.tools}</h5>{toolTags.length ? <div class="ct-tags">{toolTags.map((x) => <span>{x}</span>)}</div> : <span class="ct-empty">{L.sheet.empty}</span>}</div>
              <div><h5>{L.sheet.jamTitle}</h5><p class="ct-quote" style={`font-style:${q ? 'italic' : 'normal'};color:${q ? 'inherit' : 'var(--color-foreground-subtle)'}`}>{q ? `«${q.length > 180 ? `${q.slice(0, 180)}…` : q}»` : L.sheet.jamEmpty}</p></div>
              <div class="ct-by"><span>RR</span><div><b>{L.aside.reviewer}</b><small>{L.aside.reviewerText}</small></div></div>
            </div>
            <div class="ct-mail"><span>{L.aside.preferWrite}</span><a href={`mailto:${contactEmail}`}>{contactEmail}</a><span>{L.aside.location}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
