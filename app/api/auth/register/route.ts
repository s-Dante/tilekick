/* POST /api/auth/register
 * Body: { name, father_lastname, mother_lastname?, username, email, password, confirm_password }
 */

import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import prisma from "@/lib/database/prisma"
import { hashPassword } from "@/lib/auth/password"
import { createToken } from "@/lib/auth/jwt"

const COOKIE_NAME = "tk_session"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, father_lastname, mother_lastname, username, email, password, confirm_password } = body

        // ── Validaciones ──────────────────────────────────────────────
        if (!name || !father_lastname || !username || !email || !password || !confirm_password) {
            return NextResponse.json({ error: "Todos los campos obligatorios son requeridos" }, { status: 400 })
        }

        if (password !== confirm_password) {
            return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/
        if (!passwordRegex.test(password)) {
            return NextResponse.json({ error: "La contraseña no cumple con los requisitos de seguridad" }, { status: 400 })
        }

        // Username: solo letras, números, guión bajo, punto. 3-20 chars
        const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/
        if (!usernameRegex.test(username)) {
            return NextResponse.json({ error: "El username solo puede contener letras, números, _ y . (3-20 caracteres)" }, { status: 400 })
        }

        // ── Verificar duplicados ──────────────────────────────────────
        const existingEmail = await prisma.user.findUnique({ where: { email } })
        if (existingEmail) {
            return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 })
        }

        const existingUsername = await prisma.user.findUnique({ where: { username } })
        if (existingUsername) {
            return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 409 })
        }

        // ── Crear usuario ─────────────────────────────────────────────
        const id = randomUUID()
        const fullName = [name, father_lastname, mother_lastname].filter(Boolean).join(" ")
        const passwordHash = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                id,
                email,
                username: username.toLowerCase(),
                name: fullName,
                provider: "local",
                providerId: id,
                passwordHash,
                updatedAt: new Date(),
            },
        })

        // Crear stats y preferencias por defecto
        await prisma.userStats.create({
            data: { id: randomUUID(), userId: id, updatedAt: new Date() },
        })

        await prisma.userPreferences.create({
            data: { id: randomUUID(), userId: id, updatedAt: new Date() },
        })

        // ── Establecer sesión (cookie directa en response) ───────────
        const token = createToken({ userId: user.id, email: user.email, username: user.username })

        const response = NextResponse.json({
            message: "Registro exitoso",
            user: { id: user.id, email: user.email, username: user.username, name: user.name },
        }, { status: 201 })

        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   7 * 24 * 60 * 60,
        })

        return response

    } catch (error) {
        console.error("[Register Error]", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
