"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import bcrypt from "bcryptjs";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import {
  SignInFormValues,
  signInSchema,
  type SignUpFormValues,
  signUpSchema,
} from "@/lib/schemas";

export async function signUpAction(data: SignUpFormValues) {
  try {
    const validatedData = await signUpSchema.parseAsync(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An error occurred during sign up",
    };
  }
}

export async function signInAction(data: SignInFormValues) {
  try {
    const validatedData = await signInSchema.parseAsync(data);
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signIn();
  redirect("/sign-in");
}
