import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedPostTechStack() {
    const posts = await prisma.post.findMany({ select: { id: true } });
    const techs = await prisma.techStack.findMany({ select: { id: true } });
    if (posts.length === 0 || techs.length === 0) {
        console.warn('No posts or techstack found, skipping PostTechStack seeder.');
        return;
    }
    for (const post of posts) {
        const usedTechs = faker.helpers.arrayElements(techs, { min: 1, max: 3 });
        for (const tech of usedTechs) {
            await prisma.postTechStack.upsert({
                where: { id: faker.string.uuid() },
                update: {},
                create: {
                    postId: post.id,
                    techStackId: tech.id,
                },
            });
        }
    }
    console.log('PostTechStack seeds inserted');
}
