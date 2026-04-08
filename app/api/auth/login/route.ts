/* POST /api/auth/login
 * Body: { identification, password }
 * `identification` puede ser email o username.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/database/prisma"
import { verifyPassword } from "@/lib/auth/password"
import { createToken } from "@/lib/auth/jwt"

const COOKIE_NAME = "tk_session"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { identification, password } = body

        if (!identification || !password) {
            return NextResponse.json({ error: "Correo/username y contraseña son requeridos" }, { status: 400 })
        }

        // ── Buscar usuario por email o username ───────────────────────
        const isEmail = identification.includes("@")

        const user = isEmail
            ? await prisma.user.findUnique({ where: { email: identification } })
            : await prisma.user.findUnique({ where: { username: identification.toLowerCase() } })

        if (!user) {
            return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
        }

        if (!user.passwordHash) {
            return NextResponse.json({ error: "Esta cuenta no tiene contraseña configurada" }, { status: 401 })
        }

        // ── Verificar contraseña ──────────────────────────────────────
        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) {
            return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
        }

        // ── Actualizar último login ───────────────────────────────────
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date(), updatedAt: new Date() },
        })

        // ── Establecer sesión (cookie directa en response) ───────────
        const token = createToken({ userId: user.id, email: user.email, username: user.username })

        const response = NextResponse.json({
            message: "Login exitoso",
            user: { id: user.id, email: user.email, username: user.username, name: user.name },
        })

        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   7 * 24 * 60 * 60,
        })

        return response

    } catch (error) {
        console.error("[Login Error]", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
