import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedExperiences() {
    const users = await prisma.user.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (users.length === 0 || techs.length === 0) {
        console.warn('No users or techstack found, skipping experience seeder.');
        return;
    }
    for (let i = 0; i < 20; i++) {
        const user = faker.helpers.arrayElement(users);
        const expTechs = faker.helpers.arrayElements(techs, { min: 2, max: 5 });
        await prisma.experience.upsert({
            where: { id: faker.string.uuid() },
            update: {},
            create: {
                company: faker.company.name(),
                position: faker.person.jobTitle(),
                description: faker.person.jobDescriptor(),
                startDate: faker.date.past({ years: 5 }),
                endDate: faker.datatype.boolean() ? faker.date.recent({ days: 200 }) : null,
                userId: user.id,
                techStack: {
                    create: expTechs.map((t) => ({ techStackId: t.id })),
                },
            },
        });
    }
    console.log('Experience seeds inserted');
}
