"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { Category, Project } from "@/types/project";

export async function getApprovedProjects({
  search = "",
  categoryIds = [] as string[],
  sortBy = "newest",
  page = 1,
  pageSize = 6,
} = {}) {
  try {
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
      status: "APPROVED",
    };

    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { author: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "alphabetical") {
      orderBy = { title: "asc" };
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          author: {
            select: {
              fullName: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    const formattedProjects: Project[] = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      githubUrl: p.githubUrl,
      websiteUrl: p.websiteUrl || "",
      status: "approved",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      authorName: p.author.fullName,
      authorEmail: p.author.email,
      authorAvatar: "",
      categories: p.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        color: pc.category.color,
        projectCount: 0,
        createdAt: pc.category.createdAt.toISOString(),
      })),
    }));

    return {
      success: true,
      data: formattedProjects,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Fetch approved projects error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const formattedCategories: Category[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      color: c.color,
      projectCount: 0, // Could be calculated but let's keep it simple
      createdAt: c.createdAt.toISOString(),
    }));

    return { success: true, data: formattedCategories };
  } catch (error) {
    console.error("Fetch categories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}
