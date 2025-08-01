import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedCertifications() {
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) {
        console.warn('No users found, skipping certification seeder.');
        return;
    }
    for (let i = 0; i < 20; i++) {
        const user = faker.helpers.arrayElement(users);
        await prisma.certification.upsert({
            where: { id: faker.string.uuid() },
            update: {},
            create: {
                name: faker.person.jobArea() + ' Certification',
                issuer: faker.company.name(),
                date: faker.date.past({ years: 5 }),
                url: faker.internet.url(),
                userId: user.id,
            },
        });
    }
    console.log('Certification seeds inserted');
}
