/* ═══════════════════════════════════════════════════════════════════════════
 * JWT — Generación y verificación con Node.js crypto (HMAC-SHA256)
 * Sin dependencias externas (reemplaza jsonwebtoken).
 * ═══════════════════════════════════════════════════════════════════════════ */

import { createHmac } from "crypto"

const SECRET = process.env.JWT_SECRET ?? "default-dev-secret-change-me"

/** Payload público que viaja en el token. */
export interface JWTPayload {
    userId: string
    email:  string
    username: string
    iat:    number   // issued at (epoch seconds)
    exp:    number   // expires (epoch seconds)
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function base64url(input: string | Buffer): string {
    const b = typeof input === "string" ? Buffer.from(input) : input
    return b.toString("base64url")
}

function fromBase64url(input: string): string {
    return Buffer.from(input, "base64url").toString("utf8")
}

function sign(data: string): string {
    return createHmac("sha256", SECRET).update(data).digest("base64url")
}

/** Convierte "7d", "24h", "30m" a segundos. */
function parseDuration(d: string): number {
    const match = d.match(/^(\d+)(s|m|h|d)$/)
    if (!match) return 7 * 24 * 3600 // default 7 días
    const n = parseInt(match[1])
    switch (match[2]) {
        case "s": return n
        case "m": return n * 60
        case "h": return n * 3600
        case "d": return n * 86400
        default:  return 7 * 86400
    }
}

/* ── API pública ───────────────────────────────────────────────────────── */

/**
 * Crea un JWT firmado.
 * @param data  Datos del usuario (sin iat/exp)
 * @param expiresIn  e.g. "7d", "24h"
 */
export function createToken(
    data: Omit<JWTPayload, "iat" | "exp">,
    expiresIn?: string,
): string {
    const now = Math.floor(Date.now() / 1000)
    const ttl = parseDuration(expiresIn ?? process.env.JWT_EXPIRES_IN ?? "7d")

    const payload: JWTPayload = {
        ...data,
        iat: now,
        exp: now + ttl,
    }

    const header  = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    const body    = base64url(JSON.stringify(payload))
    const signature = sign(`${header}.${body}`)

    return `${header}.${body}.${signature}`
}

/**
 * Verifica un JWT y devuelve el payload o null si es inválido/expirado.
 */
export function verifyToken(token: string): JWTPayload | null {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, body, signature] = parts

    // Verificar firma
    const expected = sign(`${header}.${body}`)
    if (signature !== expected) return null

    // Decodificar payload
    try {
        const payload: JWTPayload = JSON.parse(fromBase64url(body))

        // Verificar expiración
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp < now) return null

        return payload
    } catch {
        return null
    }
}
