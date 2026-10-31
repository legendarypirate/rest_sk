import { PLATFORM_SUPER_ADMIN_SLUG } from '@packages/types';

import { createPrisma } from './seeds/client';
import { seedFoods } from './seeds/foods.seed';
import { seedResources } from './seeds/resources.seed';
import { seedRoles } from './seeds/roles.seed';
import { seedUsers } from './seeds/users.seed';

async function seed() {
  const prisma = createPrisma();

  try {
    const { email } = await prisma.$transaction(
      async (tx) => {
        const permissions = await seedResources(tx);
        const role = await seedRoles(tx, permissions);
        return seedUsers(tx, role.id);
      },
      { timeout: 60_000 },
    );

    const foodCount = await seedFoods(prisma);
    console.log(
      `Seeded platform admin ${email} with role ${PLATFORM_SUPER_ADMIN_SLUG}`,
    );
    console.log(`Seeded ${foodCount} foods from prisma/data/foods.csv`);
  } finally {
    await prisma.$disconnect();
  }
}

void seed();
