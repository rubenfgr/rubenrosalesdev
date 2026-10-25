interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const headings = new Set(['h2', 'h3', 'h4']);

const textOf = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

// Mismo criterio que el slugger de Astro: minúsculas, sin signos, espacios a guiones, acentos conservados.
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

// Ancla enlazable en cada encabezado (visible al hover y al foco, ver prose.css).
// Astro asigna los `id` después de los plugins de usuario, y respeta los que ya existen,
// así que el plugin los genera aquí.
export default function rehypeHeadingAnchors() {
  return (tree: HastNode) => {
    const used = new Map<string, number>();
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName && headings.has(node.tagName)) {
        const base = slugify(textOf(node));
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n}`;
        node.properties = { ...node.properties, id };
        node.children = [
          ...(node.children ?? []),
          {
            type: 'element',
            tagName: 'a',
            properties: { className: ['anchor'], href: `#${id}`, ariaLabel: 'Enlace a esta sección' },
            children: [{ type: 'text', value: '#' }],
          },
        ];
        return;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
