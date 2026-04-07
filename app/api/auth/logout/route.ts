/* POST /api/auth/logout */

import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth/cookies"

export async function POST() {
    await clearSession()
    return NextResponse.json({ message: "Sesión cerrada" })
}
