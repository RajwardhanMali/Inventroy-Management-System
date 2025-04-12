import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin-only routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/logs") || request.nextUrl.pathname.startsWith("/register")

  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/alerts/:path*",
    "/logs/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
}
