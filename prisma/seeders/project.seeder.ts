import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProjects() {
    // Get users and techstack
    const users = await prisma.user.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (users.length === 0 || techs.length === 0) {
        console.warn('No users or techstack found, skipping project seeder.');
        return;
    }
    for (let i = 0; i < 20; i++) {
        const user = faker.helpers.arrayElement(users);
        const projectTechs = faker.helpers.arrayElements(techs, { min: 2, max: 5 });
        const title = faker.commerce.productName() + ' Project';
        await prisma.project.upsert({
            where: { id: faker.string.uuid() }, // Will not match, so always create
            update: {},
            create: {
                title,
                description: faker.commerce.productDescription(),
                url: faker.internet.url(),
                imageUrl: faker.image.urlPicsumPhotos({ width: 600, height: 400 }),
                startDate: faker.date.past({ years: 3 }),
                endDate: faker.datatype.boolean() ? faker.date.recent({ days: 100 }) : null,
                userId: user.id,
                techStack: {
                    create: projectTechs.map((t) => ({ techStackId: t.id })),
                },
            },
        });
    }
    console.log('Project seeds inserted');
}
