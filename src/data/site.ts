// Datos del sitio: viven en JSON (src/data/*.json) y se validan al compilar.
import about from './about.json';
import contact from './contact.json';
import demo from './demo.json';
import home from './home.json';
import navigation from './navigation.json';
import owner from './owner.json';
import { aboutSchema, contactSchema, demoSchema, homeSchema, navigationSchema, ownerSchema, siteSchema } from './schema';
import site from './site.json';

const nav = navigationSchema.parse(navigation);

export const siteData = siteSchema.parse(site);
export { siteData as site };
export const ownerData = ownerSchema.parse(owner);
export { ownerData as owner };
export const navLinks = nav.main;
export const legalLinks = nav.legal;
export const demoData = demoSchema.parse(demo);
export const aboutData = aboutSchema.parse(about);
export const contactData = contactSchema.parse(contact);
export const homeData = homeSchema.parse(home);
