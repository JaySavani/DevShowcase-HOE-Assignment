// auth.config.edge.ts
import type { NextAuthConfig } from "next-auth";

export const authConfigEdge = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      console.log("auth in authorized", auth);
      const isLoggedIn = !!auth?.user;

      const protectedRoutes = ["/submit", "/my-projects"];
      const adminRoutes = ["/admin"];
      const authRoutes = ["/sign-in", "/sign-up"];

      const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      const isAuthRoute = authRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      const isAdminRoute = adminRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (!isLoggedIn && (isProtectedRoute || isAdminRoute)) {
        return false;
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isLoggedIn && isAdminRoute) {
        if (auth?.user?.role === "ADMIN") {
          console.log("Admin route");
          return true;
        }
        console.log("Not admin");
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers go in the main auth.ts, not here
} satisfies NextAuthConfig;
