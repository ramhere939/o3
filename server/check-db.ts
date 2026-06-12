import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log("Total products in DB:", count);
  
  const oos = await prisma.product.count({ where: { inStock: false }});
  console.log("Out of stock products:", oos);
}

main().finally(() => prisma.$disconnect());
