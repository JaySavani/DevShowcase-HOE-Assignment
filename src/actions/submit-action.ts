"use server";

import { revalidatePath } from "next/cache";

import { ZodError } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProjectFormValues, projectSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

export async function submitProject(data: ProjectFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = await projectSchema.parseAsync(data);

    const baseSlug = slugify(validatedData.title);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    await prisma.project.create({
      data: {
        title: validatedData.title,
        slug: uniqueSlug,
        description: validatedData.description,
        githubUrl: validatedData.githubUrl,
        websiteUrl: validatedData.websiteUrl || null,
        authorId: session.user.id,
        categories: {
          create: validatedData.categoryIds.map((id) => ({
            category: { connect: { id } },
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/my-projects");

    return {
      success: true,
      message:
        "Project submitted successfully! It will be visible after approval.",
    };
  } catch (error) {
    console.error("Submit project error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: "Invalid data" };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
