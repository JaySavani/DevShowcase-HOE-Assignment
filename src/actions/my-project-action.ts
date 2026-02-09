"use server";

import { revalidatePath } from "next/cache";

import { ProjectStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProjectFormValues, projectSchema } from "@/lib/schemas";

export async function getMyProjects({
  search = "",
  status = "all",
  page = 1,
  pageSize = 6,
} = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
      authorId: session.user.id,
    };

    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status.toUpperCase() as ProjectStatus;
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          author: true,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    // Fetch votes for these projects
    const projectIds = projects.map((p) => p.id);
    const voteCounts = await prisma.vote.groupBy({
      by: ["projectId", "value"],
      where: {
        projectId: { in: projectIds },
      },
      _count: true,
    });

    // Transform to match the UI expectation
    const formattedProjects = projects.map((p) => {
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
        websiteUrl: p.websiteUrl || "",
        status: p.status.toLowerCase(),
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

    // Fetch status counts for the user
    const statusCountsRaw = await prisma.project.groupBy({
      by: ["status"],
      where: { authorId: session.user.id },
      _count: true,
    });

    const statusCounts = {
      all: totalCount,
      pending: statusCountsRaw.find((s) => s.status === "PENDING")?._count || 0,
      approved:
        statusCountsRaw.find((s) => s.status === "APPROVED")?._count || 0,
      rejected:
        statusCountsRaw.find((s) => s.status === "REJECTED")?._count || 0,
    };

    return {
      success: true,
      data: formattedProjects,
      statusCounts,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Fetch my projects error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function updateProject(id: string, data: ProjectFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = await projectSchema.parseAsync(data);

    // Verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id, authorId: session.user.id },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    await prisma.project.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        githubUrl: validatedData.githubUrl,
        websiteUrl: validatedData.websiteUrl || null,
        categories: {
          deleteMany: {},
          create: validatedData.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
    });

    revalidatePath("/my-projects");
    revalidatePath("/");

    return { success: true, message: "Project updated successfully" };
  } catch (error) {
    console.error("Update project error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id, authorId: session.user.id },
    });

    if (!existingProject) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/my-projects");
    revalidatePath("/");

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Delete project error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
