import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Note: localStorage is NOT accessible in Next.js middleware (server-side).
    // We check for a cookie named 'token' which is set during login/signup.
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    const protectedRoutes = [
        "/dashboard",
        "/search",
        "/profile",
        "/connections",
        "/chat",
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/search/:path*",
        "/profile/:path*",
        "/connections/:path*",
        "/chat/:path*",
    ],
};
