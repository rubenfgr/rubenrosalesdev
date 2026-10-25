import { useState } from 'preact/hooks';
import Eyebrow from './Eyebrow';
import './FAQ.css';

interface Props {
  items: { id: string; question: string; answer: string }[];
  contactHref: string;
  labels: { eyebrow: string; title1: string; title2: string; notFound: string; writeMe: string };
}

export default function FAQ({ items, contactHref, labels: L }: Props) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" class="faq">
      <div class="faq-inner" data-reveal>
        <Eyebrow text={L.eyebrow} />
        <div class="faq-grid">
          <div>
            <h2 class="faq-title">{L.title1} <span>{L.title2}</span></h2>
            <p class="faq-more">{L.notFound} <a href={contactHref}>{L.writeMe}</a>.</p>
          </div>
          <div class="faq-list">
            {items.map((f, i) => {
              const o = open === i;
              return (
                <div class={`faq-item${o ? ' open' : ''}`}>
                  <button type="button" class="faq-q" aria-expanded={o} aria-controls={`faq-a-${f.id}`} id={`faq-q-${f.id}`} onClick={() => setOpen(o ? -1 : i)}>
                    {f.question}
                    <span class="faq-sign" aria-hidden="true">{o ? '−' : '+'}</span>
                  </button>
                  {o && <p class="faq-a" id={`faq-a-${f.id}`} role="region" aria-labelledby={`faq-q-${f.id}`}>{f.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
