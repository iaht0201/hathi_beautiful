import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: 'surgictouch' },
    update: {},
    create: { name: 'SurgicTouch', slug: 'surgictouch' },
  });

  const cat = await prisma.category.upsert({
    where: { slug: 'serum' },
    update: {},
    create: { name: 'Serum', slug: 'serum' },
  });

  await prisma.product.upsert({
    where: { slug: 'serum-duong-am-30ml' },
    update: {},
    create: {
      name: 'Serum Dưỡng Ẩm 30ml',
      slug: 'serum-duong-am-30ml',
      price: 250000,
      brandId: brand.id,
      categoryId: cat.id,
      description: 'Serum cấp ẩm cho da khô.',
    },
  });
}

main()
  .then(() => console.log('Seed done'))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
