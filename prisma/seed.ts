import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TechStack base
  const ts = await prisma.techStack.create({
    data: { name: 'TypeScript', level: 'advanced' },
  });
  const react = await prisma.techStack.create({
    data: { name: 'React', level: 'advanced' },
  });
  const node = await prisma.techStack.create({
    data: { name: 'Node.js', level: 'advanced' },
  });
  const prismaTech = await prisma.techStack.create({
    data: { name: 'Prisma', level: 'intermediate' },
  });
  const tailwind = await prisma.techStack.create({
    data: { name: 'Tailwind CSS', level: 'advanced' },
  });

  // Crea usuario admin y su portfolio
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rubenrosales.dev' },
    update: {},
    create: {
      name: 'Ruben Rosales',
      email: 'admin@rubenrosales.dev',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'Desarrollador fullstack especializado en TypeScript, React y Node.js.',
          avatarUrl: 'https://avatars.githubusercontent.com/u/000000?v=4',
          location: 'España',
          website: 'https://rubenrosales.dev',
        },
      },
      posts: {
        create: [
          {
            title: '¡Bienvenido a mi portfolio!',
            summary: 'Primer post de ejemplo para el portfolio profesional.',
            content: 'Este es el primer post de ejemplo creado por el seed.',
            published: true,
            status: 'published',
            tags: ['portfolio', 'bienvenida', 'typescript'],
            publishedAt: new Date('2024-01-02'),
            techStack: {
              create: [
                { techStack: { connect: { id: ts.id } } },
                { techStack: { connect: { id: react.id } } },
              ],
            },
          },
        ],
      },
      projects: {
        create: [
          {
            title: 'Portfolio Profesional',
            description: 'Mi portfolio personal desarrollado con TanStack, Shadcn/ui y Prisma.',
            url: 'https://rubenrosales.dev',
            imageUrl: 'https://rubenrosales.dev/og-image.png',
            startDate: new Date('2024-01-01'),
            endDate: null,
            techStack: {
              create: [
                { techStack: { connect: { id: ts.id } } },
                { techStack: { connect: { id: react.id } } },
                { techStack: { connect: { id: node.id } } },
                { techStack: { connect: { id: prismaTech.id } } },
                { techStack: { connect: { id: tailwind.id } } },
              ],
            },
          },
        ],
      },
      experiences: {
        create: [
          {
            company: 'Empresa Ejemplo',
            position: 'Fullstack Developer',
            description: 'Desarrollo de aplicaciones web modernas con React, Node.js y Prisma.',
            startDate: new Date('2022-01-01'),
            endDate: null,
            techStack: {
              create: [
                { techStack: { connect: { id: ts.id } } },
                { techStack: { connect: { id: react.id } } },
                { techStack: { connect: { id: node.id } } },
              ],
            },
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'TypeScript Professional',
            issuer: 'Microsoft',
            date: new Date('2023-06-01'),
            url: 'https://www.credly.com/badges/ts-pro',
          },
        ],
      },
    },
  });

  // Crea un usuario normal
  await prisma.user.upsert({
    where: { email: 'user@rubenrosales.dev' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'user@rubenrosales.dev',
      role: 'USER',
    },
  });

  console.log('Seeds insertados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
