import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const roleRoutes: Record<string, string[]> = {
  ADMIN: ["/admin"],
  TEACHER: ["/teacher"],
  STUDENT: ["/student"],
};

const publicRoutes = ["/login", "/register", "/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((r) => pathname === r || pathname.startsWith("/api"))) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (session.user as { role: string }).role;

  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some((r) => pathname.startsWith(r))) {
      if (userRole !== role) {
        const dashboardMap: Record<string, string> = {
          ADMIN: "/admin",
          TEACHER: "/teacher",
          STUDENT: "/student",
        };
        return NextResponse.redirect(new URL(dashboardMap[userRole] || "/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
