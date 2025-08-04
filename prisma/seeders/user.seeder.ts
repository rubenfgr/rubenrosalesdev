import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
    const users = Array.from({ length: 50 }).map((_, i) => ({
        name: `User${i + 1}`,
        email: `user${i + 1}@rubenrosales.dev`,
        role: (i === 0 ? Role.ADMIN : Role.USER),
    }));
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    console.log('User seeds inserted');
}
