import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    id: "1",
    name: "Frontend",
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "2",
    name: "Backend",
    color: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
  {
    id: "3",
    name: "Full Stack",
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  {
    id: "4",
    name: "Mobile",
    color: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  },
  {
    id: "5",
    name: "DevOps",
    color: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  },
  {
    id: "6",
    name: "AI / ML",
    color: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
  },
  {
    id: "7",
    name: "Open Source",
    color: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  },
  {
    id: "8",
    name: "CLI Tools",
    color: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  },
];

async function main() {
  console.log("Start seeding...");
  for (const category of categories) {
    const upsertedCategory = await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        color: category.color,
      },
      create: {
        id: category.id,
        name: category.name,
        color: category.color,
      },
    });
    console.log(`Upserted category: ${upsertedCategory.name}`);
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
