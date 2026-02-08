import { PrismaClient, ProjectStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const category of categories) {
    await prisma.category.upsert({
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
  }

  // 2. Seed Users
  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminEmail = "admin@example.com";
  const userEmail = "user@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      fullName: "Regular User",
      email: userEmail,
      password: hashedPassword,
      role: Role.USER,
    },
  });

  // 3. Seed Projects
  console.log("Seeding projects...");
  const projectData = [
    {
      title: "Premium Dashboard Template",
      slug: "premium-dashboard-template",
      description:
        "A comprehensive admin dashboard template with React and Tailwind.",
      githubUrl: "https://github.com/admin/dashboard",
      websiteUrl: "https://dashboard.example.com",
      status: ProjectStatus.APPROVED,
      authorId: admin.id,
      categoryIds: ["1", "3"],
    },
    {
      title: "AI Image Generator",
      slug: "ai-image-generator",
      description: "A tool to generate images using stable diffusion models.",
      githubUrl: "https://github.com/user/ai-gen",
      websiteUrl: "https://ai-gen.example.com",
      status: ProjectStatus.PENDING,
      authorId: normalUser.id,
      categoryIds: ["6", "2"],
    },
    {
      title: "Legacy CLI Tool",
      slug: "legacy-cli-tool",
      description:
        "A Python CLI tool for log analysis that is no longer maintained.",
      githubUrl: "https://github.com/user/legacy-cli",
      websiteUrl: null,
      status: ProjectStatus.REJECTED,
      authorId: normalUser.id,
      categoryIds: ["8"],
    },
    {
      title: "Mobile Fitness App",
      slug: "mobile-fitness-app",
      description: "A cross-platform fitness tracking application.",
      githubUrl: "https://github.com/user/fitness-app",
      websiteUrl: "https://fitness.example.com",
      status: ProjectStatus.APPROVED,
      authorId: normalUser.id,
      categoryIds: ["4"],
    },
    {
      title: "E-commerce Hub",
      slug: "ecommerce-hub",
      description:
        "A scalable e-commerce platform built with Next.js and Prisma.",
      githubUrl: "https://github.com/user/ecommerce",
      websiteUrl: "https://shop.example.com",
      status: ProjectStatus.APPROVED,
      authorId: normalUser.id,
      categoryIds: ["1", "2", "3"],
    },
    {
      title: "Secure Auth Library",
      slug: "secure-auth-lib",
      description: "A lightweight authentication library for Node.js apps.",
      githubUrl: "https://github.com/admin/auth-lib",
      websiteUrl: null,
      status: ProjectStatus.APPROVED,
      authorId: admin.id,
      categoryIds: ["2"],
    },
    {
      title: "Weather Stats Pro",
      slug: "weather-stats-pro",
      description:
        "Advanced weather tracking and forecasting using historical data.",
      githubUrl: "https://github.com/user/weather-pro",
      websiteUrl: "https://weather.example.com",
      status: ProjectStatus.PENDING,
      authorId: normalUser.id,
      categoryIds: ["1", "6"],
    },
    {
      title: "Docker Workflow CLI",
      slug: "docker-workflow-cli",
      description:
        "Utilities to streamline Docker container orchestration locally.",
      githubUrl: "https://github.com/user/docker-cli",
      websiteUrl: null,
      status: ProjectStatus.APPROVED,
      authorId: normalUser.id,
      categoryIds: ["5", "8"],
    },
    {
      title: "Portfolio Master",
      slug: "portfolio-master",
      description: "Beautiful portfolio templates for creative professionals.",
      githubUrl: "https://github.com/admin/portfolio",
      websiteUrl: "https://portfolio.example.com",
      status: ProjectStatus.APPROVED,
      authorId: admin.id,
      categoryIds: ["1"],
    },
    {
      title: "Real-time Chat Engine",
      slug: "realtime-chat-engine",
      description:
        "A low-latency chat backend supporting rooms and private messages.",
      githubUrl: "https://github.com/user/chat-engine",
      websiteUrl: null,
      status: ProjectStatus.PENDING,
      authorId: normalUser.id,
      categoryIds: ["2", "3"],
    },
    {
      title: "Inventory Sync Bot",
      slug: "inventory-sync-bot",
      description:
        "Automated bot to sync inventory across multiple marketplaces.",
      githubUrl: "https://github.com/user/inventory-bot",
      websiteUrl: null,
      status: ProjectStatus.REJECTED,
      authorId: normalUser.id,
      categoryIds: ["2", "5"],
    },
    {
      title: "Markdown Note App",
      slug: "markdown-note-app",
      description:
        "Simple yet powerful note-taking app with full markdown support.",
      githubUrl: "https://github.com/user/notes",
      websiteUrl: "https://notes.example.com",
      status: ProjectStatus.APPROVED,
      authorId: normalUser.id,
      categoryIds: ["1", "4"],
    },
    {
      title: "Open Source UI Kit",
      slug: "open-source-ui-kit",
      description: "A free and open-source UI kit based on React.js.",
      githubUrl: "https://github.com/admin/ui-kit",
      websiteUrl: "https://ui.example.com",
      status: ProjectStatus.APPROVED,
      authorId: admin.id,
      categoryIds: ["1", "7"],
    },
    {
      title: "ML Content Filter",
      slug: "ml-content-filter",
      description: "Automated content moderation using NLP algorithms.",
      githubUrl: "https://github.com/user/moderator",
      websiteUrl: null,
      status: ProjectStatus.PENDING,
      authorId: normalUser.id,
      categoryIds: ["6", "2"],
    },
    {
      title: "Project Spotlight",
      slug: "project-spotlight",
      description: "Community-driven project discovery platform.",
      githubUrl: "https://github.com/admin/spotlight",
      websiteUrl: "https://spotlight.example.com",
      status: ProjectStatus.APPROVED,
      authorId: admin.id,
      categoryIds: ["3", "7"],
    },
  ];

  for (const p of projectData) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        status: p.status,
      },
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        githubUrl: p.githubUrl,
        websiteUrl: p.websiteUrl,
        status: p.status,
        authorId: p.authorId,
        categories: {
          create: p.categoryIds.map((cid) => ({
            category: { connect: { id: cid } },
          })),
        },
      },
    });
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
