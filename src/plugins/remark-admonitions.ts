const kinds = ['note', 'tip', 'warning', 'danger'] as const;
type Kind = (typeof kinds)[number];

const defaultTitles: Record<Kind, string> = {
  note: 'Nota',
  tip: 'Consejo',
  warning: 'Aviso',
  danger: 'Peligro',
};

// Iconos Lucide (24x24, trazo 1,5), incrustados como hast.
const icons: Record<Kind, [string, Record<string, string>][]> = {
  note: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 16v-4' }],
    ['path', { d: 'M12 8h.01' }],
  ],
  tip: [
    ['path', { d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' }],
    ['path', { d: 'M9 18h6' }],
    ['path', { d: 'M10 22h4' }],
  ],
  warning: [
    ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
    ['path', { d: 'M12 9v4' }],
    ['path', { d: 'M12 17h.01' }],
  ],
  danger: [
    ['path', { d: 'M12 16h.01' }],
    ['path', { d: 'M12 8v4' }],
    ['path', { d: 'M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z' }],
  ],
};

const isKind = (name: string): name is Kind => (kinds as readonly string[]).includes(name);

const iconNode = (kind: Kind) => ({
  type: 'element',
  tagName: 'svg',
  properties: {
    className: ['admonition-icon'],
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ariaHidden: 'true',
  },
  children: icons[kind].map(([tagName, properties]) => ({
    type: 'element',
    tagName,
    properties,
    children: [],
  })),
});

interface DirectiveNode {
  type: string;
  name?: string;
  data?: Record<string, unknown>;
  children?: DirectiveNode[];
  [key: string]: unknown;
}

const textOf = (node: DirectiveNode): string =>
  typeof node.value === 'string' ? node.value : (node.children ?? []).map(textOf).join('');

const walk = (node: DirectiveNode) => {
  if (node.type === 'containerDirective' && node.name && isKind(node.name)) {
    const kind = node.name;
    const children = node.children ?? [];
    // `:::note[Título]` llega como primer hijo párrafo con `directiveLabel`.
    const first = children[0];
    let title: string = defaultTitles[kind];
    let body = children;
    if (first?.data && (first.data as { directiveLabel?: boolean }).directiveLabel) {
      title = textOf(first) || title;
      body = children.slice(1);
    }

    node.data = {
      ...node.data,
      hName: 'aside',
      hProperties: { className: ['admonition', `admonition-${kind}`], 'data-kind': kind },
    };
    node.children = [
      {
        type: 'paragraph',
        data: {
          hName: 'p',
          hProperties: { className: ['admonition-title'] },
          hChildren: [iconNode(kind), { type: 'text', value: title }],
        },
        children: [],
      },
      {
        type: 'paragraph',
        data: { hName: 'div', hProperties: { className: ['admonition-body'] } },
        children: body,
      },
    ];
    return;
  }
  node.children?.forEach(walk);
};

// Plugin remark: `:::note`, `:::tip`, `:::warning` y `:::danger` (sintaxis de Docusaurus).
export default function remarkAdmonitions() {
  return (tree: DirectiveNode) => walk(tree);
}
