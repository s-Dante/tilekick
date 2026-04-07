/* GET /api/auth/me
 * Devuelve el usuario de la sesión actual o 401.
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/database/prisma"
import { getSession } from "@/lib/auth/cookies"

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            avatar: true,
            createdAt: true,
            lastLogin: true,
        },
    })

    if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
}
