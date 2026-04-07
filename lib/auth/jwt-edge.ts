/* ═══════════════════════════════════════════════════════════════════════════
 * JWT-EDGE — Verificación JWT compatible con Edge Runtime (Web Crypto API)
 *
 * Solo incluye verifyToken — para el middleware solo necesitamos leer,
 * no crear tokens.  La creación sigue en jwt.ts (Node runtime, API routes).
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface JWTPayload {
    userId:   string
    email:    string
    username: string
    iat:      number
    exp:      number
}

function base64urlDecode(input: string): string {
    // Reemplazar caracteres base64url → base64 estándar
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    return binary
}

function base64urlToUint8(input: string): Uint8Array {
    const raw = base64urlDecode(input)
    const arr = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
    return arr
}

function uint8ToBase64url(arr: Uint8Array): string {
    let binary = ""
    for (const byte of arr) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function hmacSign(data: string, secret: string): Promise<string> {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    )
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
    return uint8ToBase64url(new Uint8Array(sig))
}

/**
 * Verifica un JWT usando Web Crypto API (Edge-compatible).
 * Devuelve el payload o null si inválido/expirado.
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
    const secret = process.env.JWT_SECRET ?? "default-dev-secret-change-me"

    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, body, signature] = parts

    // Verificar firma con Web Crypto
    const expected = await hmacSign(`${header}.${body}`, secret)
    if (signature !== expected) return null

    // Decodificar payload
    try {
        const decoded = base64urlDecode(body)
        const payload: JWTPayload = JSON.parse(decoded)

        // Verificar expiración
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp < now) return null

        return payload
    } catch {
        return null
    }
}
