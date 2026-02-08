"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
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

export async function searchProjectSolutions(problem: string) {
  try {
    if (!problem.trim()) return { success: true, data: [] };

    const projects = await prisma.project.findMany({
      where: { status: "APPROVED" },
      include: {
        categories: { include: { category: true } },
      },
    });

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
          You are a technical assistant for a project showcase platform.
          A user is describing a problem: "${problem}"
          
          Here are some available projects:
          ${projects.map((p) => `ID: ${p.id} | Title: ${p.title} | Description: ${p.description} | Categories: ${p.categories.map((c) => c.category.name).join(", ")}`).join("\n")}
          
          Based on the user's problem, identify the top 3 projects that can provide a solution or technical reference.
          Return ONLY a JSON array of strings (the Project IDs), nothing else.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Response Text:", responseText);
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        console.log("Cleaned JSON:", cleanedJson);
        const recommendedIds: string[] = JSON.parse(cleanedJson);
        console.log("Recommended IDs:", recommendedIds);

        const recommendedProjects = recommendedIds
          .map((id) => projects.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            score: 100,
          }));

        if (recommendedProjects.length > 0) {
          return { success: true, data: recommendedProjects };
        }
      } catch (aiError) {
        console.error(
          "Gemini search error, falling back to keywords:",
          aiError
        );
      }
    }

    // Fallback ranking algorithm
    const terms = problem
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const ranked = projects
      .map((p) => {
        let score = 0;

        terms.forEach((term) => {
          if (p.title.toLowerCase().includes(term)) score += 10;
          if (p.description.toLowerCase().includes(term)) score += 5;
          if (
            p.categories.some((c) =>
              c.category.name.toLowerCase().includes(term)
            )
          )
            score += 8;
        });

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          score,
        };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { success: true, data: ranked };
  } catch (error) {
    console.error("Search solutions error:", error);
    return { success: false, error: "Failed to find solutions" };
  }
}
