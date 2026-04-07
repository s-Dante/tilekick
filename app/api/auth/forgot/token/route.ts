/* POST /api/auth/forgot/token
 * Body: { email, token }
 * Verifica que el OTP sea correcto y no haya expirado.
 * Devuelve un resetId temporal que se necesita en el paso de recovery.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/database/prisma"

export async function POST(req: NextRequest) {
    try {
        const { email, token } = await req.json()

        if (!email || !token) {
            return NextResponse.json({ error: "Correo y token son requeridos" }, { status: 400 })
        }

        // ── Buscar el token ───────────────────────────────────────────
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
        }

        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                token,
                used:   false,
                expiresAt: { gte: new Date() },
            },
        })

        if (!resetRecord) {
            return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
        }

        // Token es válido — devolver el resetId para el siguiente paso
        return NextResponse.json({
            message: "Código verificado correctamente",
            resetId: resetRecord.id,
        })

    } catch (error) {
        console.error("[Forgot/Token Error]", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
