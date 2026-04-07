/* POST /api/auth/forgot/recovery
 * Body: { resetId, password, confirm_password }
 * Cambia la contraseña y marca el token como usado.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/database/prisma"
import { hashPassword } from "@/lib/auth/password"

export async function POST(req: NextRequest) {
    try {
        const { resetId, password, confirm_password } = await req.json()

        if (!resetId || !password || !confirm_password) {
            return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
        }

        if (password !== confirm_password) {
            return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/
        if (!passwordRegex.test(password)) {
            return NextResponse.json({ error: "La contraseña no cumple con los requisitos de seguridad" }, { status: 400 })
        }

        // ── Verificar que el reset token es válido ────────────────────
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { id: resetId },
        })

        if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
            return NextResponse.json({ error: "El enlace de recuperación ya expiró o fue usado" }, { status: 400 })
        }

        // ── Actualizar contraseña ─────────────────────────────────────
        const passwordHash = await hashPassword(password)

        await prisma.user.update({
            where: { id: resetRecord.userId },
            data:  { passwordHash, updatedAt: new Date() },
        })

        // Marcar token como usado
        await prisma.passwordReset.update({
            where: { id: resetId },
            data:  { used: true },
        })

        return NextResponse.json({ message: "Contraseña actualizada exitosamente" })

    } catch (error) {
        console.error("[Forgot/Recovery Error]", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
