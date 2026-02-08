import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";

import authConfig from "./auth.config";
import { authConfigEdge } from "./auth.config.edge";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfigEdge,
  callbacks: {
    ...authConfigEdge.callbacks,
    async jwt({ token, user }) {
      // First, use the Edge-compatible logic from authConfigEdge
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        return token;
      }

      if (token.role) return token;

      // Server-side only: fetch role from DB if missing in token
      if (token.sub) {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (existingUser) {
          token.role = existingUser.role;
        }
      }

      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  ...authConfig,
});
