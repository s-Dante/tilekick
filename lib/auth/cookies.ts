/* ═══════════════════════════════════════════════════════════════════════════
 * COOKIES — Helpers para token en HttpOnly cookie
 * ═══════════════════════════════════════════════════════════════════════════ */

import { cookies } from "next/headers"
import { createToken, verifyToken, type JWTPayload } from "./jwt"

const COOKIE_NAME = "tk_session"

/**
 * Establece la cookie de sesión con el JWT.
 */
export async function setSessionCookie(data: Omit<JWTPayload, "iat" | "exp">) {
    const token = createToken(data)
    const cookieStore = await cookies()

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   7 * 24 * 60 * 60, // 7 días
    })
}

/**
 * Lee y verifica la cookie de sesión.
 * Devuelve el payload o null si no hay sesión válida.
 */
export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(COOKIE_NAME)
    if (!cookie?.value) return null
    return verifyToken(cookie.value)
}

/**
 * Elimina la cookie de sesión (logout).
 */
export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}
