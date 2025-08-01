import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedExperienceTechStack() {
    const experiences = await prisma.experience.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (experiences.length === 0 || techs.length === 0) {
        console.warn('No experiences or techstack found, skipping ExperienceTechStack seeder.');
        return;
    }
    for (const exp of experiences) {
        const usedTechs = faker.helpers.arrayElements(techs, { min: 1, max: 4 });
        for (const tech of usedTechs) {
            await prisma.experienceTechStack.upsert({
                where: { id: faker.string.uuid() },
                update: {},
                create: {
                    experienceId: exp.id,
                    techStackId: tech.id,
                },
            });
        }
    }
    console.log('ExperienceTechStack seeds inserted');
}
