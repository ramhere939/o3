import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.update({
    where: { id: 'p1' },
    data: { inStock: false }
  });
  await prisma.product.update({
    where: { id: 'p2' },
    data: { inStock: false }
  });
  console.log("Marked p1 and p2 as Out of Stock");
}

main().finally(() => prisma.$disconnect());
