import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.findMany({ where: { category: 'Inorganic Chemicals' } });
  console.log('Inorganic Chemicals:', all.length);
  console.log('InStock:', all.filter(y => y.inStock).length);
}

main().finally(() => prisma.$disconnect());
