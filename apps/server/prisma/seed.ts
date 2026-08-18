import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

import { TEST_ASCENT_ID, TEST_USER_EMAIL, TEST_USER_ID, TEST_USER_NAME } from '../src/config/testSeeds.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: { name: TEST_USER_NAME },
    create: {
      id: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
    },
  });

  await prisma.ascent.upsert({
    where: { id: TEST_ASCENT_ID },
    update: {
      routeName: 'Orange Overhang',
      grade: 'V5',
      attempts: 3,
      completed: false,
      notes: 'need a higher foot',
      userId: TEST_USER_ID,
    },
    create: {
      id: TEST_ASCENT_ID,
      routeName: 'Orange Overhang',
      grade: 'V5',
      attempts: 3,
      completed: false,
      notes: 'need a higher foot',
      userId: TEST_USER_ID,
    },
  });
}

main()
  .then(() => {
    console.log(`Seeded test user ${TEST_USER_EMAIL} and ascent ${TEST_ASCENT_ID}`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
