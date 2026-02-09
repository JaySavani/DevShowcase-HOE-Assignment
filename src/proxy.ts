import NextAuth from "next-auth";

import authConfig from "./auth.config";

const { auth: proxy } = NextAuth(authConfig);

export default proxy((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

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

  // If on auth routes (login/signup), redirect to home if already logged in
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  // Mandatory authentication for protected and admin routes
  if (!isLoggedIn && (isProtectedRoute || isAdminRoute)) {
    return Response.redirect(new URL("/sign-in", nextUrl));
  }

  // Authorization check for admin routes
  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
