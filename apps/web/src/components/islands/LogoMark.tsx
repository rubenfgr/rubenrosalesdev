// Símbolo oficial «Encaje» (assets/logo/symbol.svg) para islas. Misma geometría que Logo.astro.
// Tamaño mínimo 24 px y zona de respeto de ~27 % de su altura: el contenedor debe dejarla libre.
interface Props { tone?: 'light' | 'dark'; size?: number; label?: string }

export default function LogoMark({ tone = 'light', size = 28, label }: Props) {
  const wall = tone === 'dark' ? 'var(--color-dark-text)' : 'var(--color-brand-mark)';
  const piece = tone === 'dark' ? 'var(--color-primary-on-dark)' : 'var(--color-brand-piece)';
  return (
    <svg viewBox="0 0 84 84" width={Math.max(24, size)} height={Math.max(24, size)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} focusable="false">
      <g style={`fill:${wall}`}>
        <rect x="0" y="6" width="22" height="23" /><rect x="26" y="6" width="26" height="23" />
        <rect x="0" y="33" width="36" height="23" /><rect x="40" y="33" width="38" height="23" />
        <rect x="0" y="60" width="18" height="24" /><rect x="22" y="60" width="38" height="24" /><rect x="64" y="60" width="14" height="24" />
      </g>
      <rect class="lm-piece" x="62" y="0" width="22" height="23" style={`fill:${piece}`} />
    </svg>
  );
}
