import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Satyanarayana Pooja',  icon: '🪔', order: 1 },
  { name: 'Ganapati Pooja',       icon: '🐘', order: 2 },
  { name: 'Griha Pravesh',        icon: '🏠', order: 3 },
  { name: 'Navaratri',            icon: '🌸', order: 4 },
  { name: 'Bhajan / Kirtan',      icon: '🎵', order: 5 },
  { name: 'Havan',                icon: '🔥', order: 6 },
  { name: 'Homam',                icon: '🔥', order: 7 },
  { name: 'Annadanam',            icon: '🍛', order: 8 },
  { name: 'Shivratri',            icon: '🕉️',  order: 9 },
  { name: 'Diwali Pooja',         icon: '✨', order: 10 },
  { name: 'Lakshmi Pooja',        icon: '💛', order: 11 },
  { name: 'Rudrabhishek',         icon: '🪷', order: 12 },
  { name: 'Satsang',              icon: '🧘', order: 13 },
  { name: 'Other',                icon: '📿', order: 99 },
];

async function main() {
  console.log('🌱 Seeding event categories...');

  for (const cat of categories) {
    await prisma.eventCategory.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, order: cat.order },
      create: cat,
    });
  }

  console.log(`✅ Seeded ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
