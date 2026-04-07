/* ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE — Protección de rutas (Edge Runtime compatible)
 *
 * Rutas protegidas (requieren sesión): /home, /play, /profile, /leaderboard, /settings
 * Rutas públicas de auth: /login, /register, /forgot
 *
 * Si el usuario tiene sesión y visita /login o /register → redirige a /home
 * Si no tiene sesión y visita ruta protegida → redirige a /login
 * ═══════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/jwt-edge"

const PROTECTED_PATHS = ["/home", "/play", "/profile", "/leaderboard", "/settings"]
const AUTH_PATHS      = ["/login", "/register", "/forgot"]

const COOKIE_NAME = "tk_session"

function isProtected(pathname: string): boolean {
    return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isAuthPage(pathname: string): boolean {
    return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(COOKIE_NAME)?.value

    const session = token ? await verifyTokenEdge(token) : null

    // Ruta protegida sin sesión → login
    if (isProtected(pathname) && !session) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Página de auth con sesión activa → home
    if (isAuthPage(pathname) && session) {
        return NextResponse.redirect(new URL("/home", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/home/:path*",
        "/play/:path*",
        "/profile/:path*",
        "/leaderboard/:path*",
        "/settings/:path*",
        "/login",
        "/register",
        "/forgot/:path*",
    ],
}
