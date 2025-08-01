import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProjectTechStack() {
    const projects = await prisma.project.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (projects.length === 0 || techs.length === 0) {
        console.warn('No projects or techstack found, skipping ProjectTechStack seeder.');
        return;
    }
    for (const project of projects) {
        const usedTechs = faker.helpers.arrayElements(techs, { min: 1, max: 4 });
        for (const tech of usedTechs) {
            await prisma.projectTechStack.upsert({
                where: { id: faker.string.uuid() },
                update: {},
                create: {
                    projectId: project.id,
                    techStackId: tech.id,
                },
            });
        }
    }
    console.log('ProjectTechStack seeds inserted');
}
