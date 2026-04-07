/* ═══════════════════════════════════════════════════════════════════════════
 * MAIL — Envío de correos con nodemailer
 *
 * IMPORTANTE: necesitas instalar nodemailer en tu proyecto local:
 *   npm install nodemailer
 *   npm install -D @types/nodemailer
 *
 * Configura las variables en .env:
 *   MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS, MAIL_FROM
 * ═══════════════════════════════════════════════════════════════════════════ */

import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.MAIL_PORT ?? 465),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

interface SendMailOptions {
    to:      string
    subject: string
    html:    string
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
    return transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        to,
        subject,
        html,
    })
}

/**
 * Genera el HTML del correo con el OTP de recuperación.
 */
export function otpEmailTemplate(otpCode: string, userName: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; border-radius: 16px; color: #e5e5e5;">
        <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 800; color: #ffffff;">TileKick</h1>
        <p style="margin: 0 0 24px; color: #a3a3a3; font-size: 14px;">Recuperación de contraseña</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5;">
            Hola <strong>${userName}</strong>, recibimos una solicitud para restablecer tu contraseña.
            Usa el siguiente código de verificación:
        </p>

        <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; background: #1a1a2e; border: 2px solid #333; border-radius: 12px; padding: 16px 32px; color: #ffffff; font-family: monospace;">
                ${otpCode}
            </span>
        </div>

        <p style="margin: 0 0 8px; font-size: 13px; color: #a3a3a3;">
            Este código expira en <strong style="color: #e5e5e5;">15 minutos</strong>.
        </p>
        <p style="margin: 0; font-size: 13px; color: #737373;">
            Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta está segura.
        </p>
    </div>
    `
}
