"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { Category, Project, ProjectStatus } from "@/types/project";

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
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    // Fetch votes for these projects efficiently
    const projectIds = projects.map((p) => p.id);
    const voteCounts = await prisma.vote.groupBy({
      by: ["projectId", "value"],
      where: {
        projectId: { in: projectIds },
      },
      _count: true,
    });

    const formattedProjects: Project[] = projects.map((p) => {
      const pUpvotes =
        voteCounts.find((v) => v.projectId === p.id && v.value === 1)?._count ||
        0;
      const pDownvotes =
        voteCounts.find((v) => v.projectId === p.id && v.value === -1)
          ?._count || 0;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        githubUrl: p.githubUrl,
        websiteUrl: p.websiteUrl,
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
        stats: {
          upvotes: pUpvotes,
          downvotes: pDownvotes,
          commentCount: p._count.comments,
        },
      };
    });

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

export async function getProjectBySlug(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
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
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Separate count for upvotes and downvotes
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({ where: { projectId: project.id, value: 1 } }),
      prisma.vote.count({ where: { projectId: project.id, value: -1 } }),
    ]);

    const formattedProject: Project & {
      stats: { upvotes: number; downvotes: number; commentCount: number };
    } = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      githubUrl: project.githubUrl,
      websiteUrl: project.websiteUrl,
      status: project.status.toLowerCase() as ProjectStatus,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      authorName: project.author.fullName,
      authorEmail: project.author.email,
      authorAvatar: "",
      categories: project.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        color: pc.category.color,
        projectCount: 0,
        createdAt: pc.category.createdAt.toISOString(),
      })),
      stats: {
        upvotes,
        downvotes,
        commentCount: project._count.comments,
      },
    };

    return { success: true, data: formattedProject };
  } catch (error) {
    console.error("Fetch project details error:", error);
    return { success: false, error: "Failed to fetch project details" };
  }
}
