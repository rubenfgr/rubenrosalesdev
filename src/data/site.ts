export const site = {
  name: 'Rubén Rosales',
  url: 'https://rubenrosales.dev',
  title: 'Rubén Rosales · Software, automatización e IA',
  description:
    'Diseño y desarrollo software, automatizaciones e integraciones con IA para pymes y profesionales. Soluciones claras, mantenibles y sin sobreingeniería.',
  descriptor: 'Software, automatización e IA',
  tagline: 'Software, automatización e IA para pymes y profesionales.',
  github: 'https://github.com/rubenfgr',
  linkedin: 'https://www.linkedin.com/in/rubenrosalesdev',
} as const;

export const navLinks = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/sobre-mi', label: 'Cómo trabajo' },
  { href: '/blog', label: 'Blog' },
] as const;

export const legalLinks = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/cookies', label: 'Cookies' },
] as const;
