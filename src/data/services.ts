export interface Service {
  id: 'automatizacion' | 'web' | 'movil';
  title: string;
  summary: string;
  points: string[];
  forWhom: string;
  receive: string;
  notRecommended: string;
}

const receive =
  'La aplicación o automatización funcionando, documentación de uso y una explicación de qué hace falta para mantenerla.';

export const services: Service[] = [
  {
    id: 'automatizacion',
    title: 'Automatización de procesos e IA',
    summary:
      'Tareas repetitivas que hoy hace alguien a mano: pasar pedidos del email al programa de gestión, leer facturas, enviar recordatorios, responder preguntas frecuentes. Las automatizo y, cuando aporta, incorporo IA.',
    points: [
      'Extracción de datos de facturas, pedidos y albaranes',
      'Conexión entre tus herramientas: CRM, ERP, email, formularios, hojas de cálculo',
      'Asistentes con IA que responden con la información de tu negocio',
      'Avisos y recordatorios automáticos',
    ],
    forWhom: '[VERIFICAR: 1–2 tipos de negocio que Rubén quiera priorizar en automatización]',
    receive,
    notRecommended:
      'Si el proceso cambia cada semana, primero hay que ordenarlo; automatizar el desorden solo lo acelera.',
  },
  {
    id: 'web',
    title: 'Aplicaciones web y herramientas internas',
    summary:
      'Paneles de gestión, portales para clientes y aplicaciones a medida cuando las herramientas genéricas se quedan cortas.',
    points: [
      'Paneles de gestión y administración',
      'Portales para clientes o socios',
      'Integración con los sistemas que ya usas',
      'Webs rápidas y fáciles de mantener',
    ],
    forWhom: '[VERIFICAR: 1–2 tipos de negocio que Rubén quiera priorizar en aplicaciones web]',
    receive,
    notRecommended:
      'Si una herramienta existente cubre el 90 % de lo que necesitas, normalmente sale más a cuenta adaptarla.',
  },
  {
    id: 'movil',
    title: 'Aplicaciones móviles',
    summary: 'Apps para iOS y Android conectadas con tu sistema, para tu equipo o para tus clientes.',
    points: [
      'Apps internas: inventario, partes de trabajo, fichajes',
      'Apps para clientes: reservas, seguimiento, avisos',
      'Funcionamiento sin conexión cuando hace falta',
      'Publicación en App Store y Google Play',
    ],
    forWhom: '[VERIFICAR: 1–2 tipos de negocio que Rubén quiera priorizar en apps móviles]',
    receive,
    notRecommended:
      'Si tus usuarios solo la abrirían de vez en cuando, una web bien hecha suele bastar.',
  },
];
