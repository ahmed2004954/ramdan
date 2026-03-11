const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { loadEnvIfExists } = require('../server/utils/loadEnv');

loadEnvIfExists();

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ramadan2026';

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.log(`المستخدم الإداري "${username}" موجود بالفعل.`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`تم إنشاء المستخدم الإداري الافتراضي "${username}".`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
