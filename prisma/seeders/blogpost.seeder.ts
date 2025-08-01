import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedBlogPosts() {
    const users = await prisma.user.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (users.length === 0 || techs.length === 0) {
        console.warn('No users or techstack found, skipping blogpost seeder.');
        return;
    }
    for (let i = 0; i < 20; i++) {
        const user = faker.helpers.arrayElement(users);
        const postTechs = faker.helpers.arrayElements(techs, { min: 1, max: 4 });
        await prisma.post.upsert({
            where: { id: faker.string.uuid() },
            update: {},
            create: {
                title: faker.lorem.sentence({ min: 3, max: 7 }),
                summary: faker.lorem.sentence(),
                content: faker.lorem.paragraphs({ min: 2, max: 5 }),
                published: true,
                status: 'published',
                tags: faker.lorem.words({ min: 2, max: 5 }).split(' '),
                publishedAt: faker.date.past({ years: 2 }),
                authorId: user.id,
                techStack: {
                    create: postTechs.map((t) => ({ techStackId: t.id })),
                },
            },
        });
    }
    console.log('BlogPost seeds inserted');
}
