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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    // Transform to match the UI expectation if needed
    const formattedProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
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
        color: pc.category.color,
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
