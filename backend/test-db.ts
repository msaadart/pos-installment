import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log(result);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();