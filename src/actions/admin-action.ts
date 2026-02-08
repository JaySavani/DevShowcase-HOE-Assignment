"use server";

import { revalidatePath } from "next/cache";

import { ProjectStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  type CategoryFormValues,
  categorySchema,
  type ProjectFormValues,
  projectSchema,
} from "@/lib/schemas";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

// PROJECTS
export async function getAllProjects({
  search = "",
  status = "all",
  categoryId = "all",
  page = 1,
  pageSize = 8,
} = {}) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {};

    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status !== "all") {
      where.status = status.toUpperCase() as ProjectStatus;
    }

    if (categoryId !== "all") {
      where.categories = {
        some: {
          categoryId,
        },
      };
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

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
    console.error("Fetch all projects error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function updateProjectStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/explore");

    return {
      success: true,
      message: `Project ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Failed to update project status" };
  }
}

export async function adminUpdateProject(id: string, data: ProjectFormValues) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = await projectSchema.parseAsync(data);

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

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/explore");

    return { success: true, message: "Project updated successfully" };
  } catch (error) {
    console.error("Admin update project error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function adminDeleteProject(id: string) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/explore");

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Admin delete project error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

// CATEGORIES
export async function getAdminCategories() {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      projectCount: c._count.projects,
      createdAt: c.createdAt.toISOString(),
    }));

    return { success: true, data: formattedCategories };
  } catch (error) {
    console.error("Fetch categories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createCategory(data: CategoryFormValues) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = await categorySchema.parseAsync(data);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/submit");

    return {
      success: true,
      data: category,
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = await categorySchema.parseAsync(data);

    await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/submit");

    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/submit");

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
