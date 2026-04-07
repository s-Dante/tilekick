/* POST /api/auth/forgot/validate
 * Body: { email }
 * Busca al usuario, genera OTP de 6 caracteres, lo guarda en BD y envía correo.
 */

import { NextRequest, NextResponse } from "next/server"
import { randomUUID, randomInt } from "crypto"
import prisma from "@/lib/database/prisma"
import { sendMail, otpEmailTemplate } from "@/lib/auth/mail"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "El correo es requerido" }, { status: 400 })
        }

        // ── Buscar usuario ────────────────────────────────────────────
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // Por seguridad no revelamos si el email existe o no
            return NextResponse.json({
                message: "Si el correo está registrado, recibirás un código de verificación",
            })
        }

        // ── Invalidar tokens anteriores ───────────────────────────────
        await prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data:  { used: true },
        })

        // ── Generar OTP de 6 dígitos ──────────────────────────────────
        const otpCode = String(randomInt(0, 999999)).padStart(6, "0")

        await prisma.passwordReset.create({
            data: {
                id:        randomUUID(),
                userId:    user.id,
                token:     otpCode,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
            },
        })

        // ── Enviar correo ─────────────────────────────────────────────
        await sendMail({
            to:      user.email,
            subject: "TileKick — Código de recuperación",
            html:    otpEmailTemplate(otpCode, user.name),
        })

        return NextResponse.json({
            message: "Si el correo está registrado, recibirás un código de verificación",
        })

    } catch (error) {
        console.error("[Forgot/Validate Error]", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
