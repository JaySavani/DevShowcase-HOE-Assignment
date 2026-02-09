"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function voteProject(projectId: string, value: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to vote" };
  }

  if (value !== 1 && value !== -1 && value !== 0) {
    return { success: false, error: "Invalid vote value" };
  }

  try {
    if (value === 0) {
      // Remove vote
      await prisma.vote.deleteMany({
        where: {
          userId: session.user.id,
          projectId,
        },
      });
    } else {
      // Upsert vote
      await prisma.vote.upsert({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId,
          },
        },
        update: {
          value,
        },
        create: {
          userId: session.user.id,
          projectId,
          value,
        },
      });
    }

    revalidatePath(`/projects/[slug]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Vote project error:", error);
    return { success: false, error: "Failed to process vote" };
  }
}

export async function addComment(projectId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to comment" };
  }

  if (!content.trim()) {
    return { success: false, error: "Comment cannot be empty" };
  }

  try {
    await prisma.comment.create({
      data: {
        content,
        projectId,
        userId: session.user.id,
      },
    });

    revalidatePath(`/projects/[slug]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Add comment error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getComments(
  projectId: string,
  page: number = 1,
  pageSize: number = 5
) {
  try {
    const skip = (page - 1) * pageSize;

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.comment.count({ where: { projectId } }),
    ]);

    return {
      success: true,
      data: comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.user.fullName,
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        totalCount,
        hasMore: totalCount > skip + comments.length,
      },
    };
  } catch (error) {
    console.error("Fetch comments error:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}

export async function getUserVote(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: true, value: 0 };

  try {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    return { success: true, value: vote?.value || 0 };
  } catch (error) {
    console.error("Get user vote error:", error);
    return { success: false, error: "Failed to get user vote" };
  }
}
