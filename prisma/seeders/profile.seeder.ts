import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProfiles() {
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) {
        console.warn('No users found, skipping profile seeder.');
        return;
    }
    for (const user of users) {
        await prisma.profile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                bio: faker.person.bio(),
                avatarUrl: faker.image.avatar(),
                location: faker.location.city(),
                website: faker.internet.url(),
                userId: user.id,
            },
        });
    }
    console.log('Profile seeds inserted');
}
