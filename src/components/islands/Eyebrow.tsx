/** «00 / diagnóstico»: el primer fragmento es el número de sección. */
export default function Eyebrow({ text, dark = false }: { text: string; dark?: boolean }) {
  const [num, ...rest] = text.split(' ');
  return (
    <div class={`eb${dark ? ' dark' : ''}`}>
      <span class="eb-num">{num}</span>
      <span>{rest.join(' ')}</span>
      <span class="eb-rule" />
    </div>
  );
}
