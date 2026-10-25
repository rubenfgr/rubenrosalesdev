import './MobileMenu.css';
import { useEffect, useRef, useState } from 'preact/hooks';

interface Item {
  id: string;
  label: string;
  href: string;
}
interface Props {
  items: Item[];
  cta: string;
  contactHref: string;
  email: string;
  labels: { menu: string; openMenu: string; closeMenu: string };
  switchHref: string;
  switchLabel: string;
  switchCode: string;
  switchAria: string;
  otherLang: string;
}

const ICONS: Record<string, string> = {
  services: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  projects: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z',
  calculator: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01',
  blog: 'M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 18h3',
  how: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  method: 'M4 6h16M4 12h10M4 18h6M18 14l2 2 4-4',
  faq: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
};

export default function MobileMenu({ items, cta, contactHref, email, labels, switchHref, switchLabel, switchCode, switchAria, otherLang }: Props) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    // Al pasar a escritorio el panel se cierra.
    const mq = matchMedia('(min-width: 75rem)');
    const onMq = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        class={`mm-btn${open ? ' is-open' : ''}`}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h10'} />
        </svg>
      </button>
      {open && (
        <>
          <div class="mm-overlay" onClick={() => setOpen(false)} />
          <div class="mm-panel" id="mobile-menu">
            <nav class="mm-nav" aria-label={labels.menu}>
              {items.map((it) => (
                <a href={it.href} onClick={() => setOpen(false)}>
                  <span class="mm-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d={ICONS[it.id] ?? ICONS.services} />
                    </svg>
                  </span>
                  <span class="mm-label">{it.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
              ))}
            </nav>
            <div class="mm-foot">
              <a class="mm-cta" href={contactHref} onClick={() => setOpen(false)}>
                {cta} <span class="mono-arrow">→</span>
              </a>
              <a class="mm-lang" href={switchHref} hreflang={otherLang} lang={otherLang} aria-label={switchAria}>
                {switchCode} · {switchLabel}
              </a>
              <a class="mm-mail" href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
