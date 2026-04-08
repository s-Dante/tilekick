/* POST /api/auth/logout
 * Elimina la cookie de sesión (cookie directa en response).
 */

import { NextResponse } from "next/server"

const COOKIE_NAME = "tk_session"

export async function POST() {
    const response = NextResponse.json({ message: "Sesión cerrada" })

    // Borrar cookie seteándola vacía con maxAge=0
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   0,
    })

    return response
}
