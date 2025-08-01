import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const techNames = [
  'TypeScript', 'React', 'Node.js', 'Prisma', 'Tailwind CSS', 'Next.js', 'Angular', 'NestJS',
  'PostgreSQL', 'Docker', 'Jest', 'Cypress', 'GraphQL', 'Redux', 'Sass', 'HTML5', 'CSS3',
  'JavaScript', 'Express', 'MongoDB', 'Vite', 'Webpack', 'Figma', 'Storybook', 'Jenkins',
  'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'ESLint', 'Prettier', 'Mocha', 'Chai', 'Vitest',
  'Socket.io', 'Redis', 'RabbitMQ', 'Kubernetes', 'Svelte', 'Vue.js'
];

export async function seedTechStack() {
  const techStacks = techNames.slice(0, 25).map((name) => ({
    name,
    level: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
  }));
  await prisma.techStack.createMany({
    data: techStacks,
    skipDuplicates: true,
  });
  console.log('TechStack seeds inserted');
}
