import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';


async function main() {
    const email = 'user@test.com';
    const password = 'Abcd1234!';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Test User',
            dogName: 'Sparky',
            dogPersonality: 'Playful Shepherd',
            theme: 'golden',
        },
    });

    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
