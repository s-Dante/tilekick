"use client"

import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input, Toaster, Button, Label } from "@/components/index"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotStepper from "@/components/authComponents/ForgotStepper"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ValidateFormInputs {
    email: string
}

export default function ValidatePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<ValidateFormInputs>()

    const onSubmit: SubmitHandler<ValidateFormInputs> = async (data) => {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/forgot/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? "Error al enviar el código")
                return
            }

            toast.success("Código enviado a tu correo")
            // Pasar email al siguiente paso
            router.push(`/forgot/token?email=${encodeURIComponent(data.email)}`)
        } catch {
            toast.error("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const onError = () => {
        if (errors.email) toast.error(errors.email.message)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-4">
                <ForgotStepper currentStep={1} />
                <div>
                    <CardTitle className="text-3xl">Recuperar contraseña</CardTitle>
                    <CardDescription className="mt-1 text-lg">
                        Ingresa tu correo y te enviaremos un código de verificación
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Toaster position="top-center" richColors />

                <CardContent>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Correo</Label>
                        <Input
                            type="email" id="email" disabled={loading}
                            {...register("email", {
                                required: { value: true, message: "Necesitas ingresar tu correo" },
                            })}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 mt-8">
                    <Button type="submit" className="w-full cursor-pointer text-xl" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar código"}
                    </Button>
                    <p className="text-md text-muted-foreground text-center">
                        <Link href="/login">
                            <Button variant="link" className="h-auto p-0 text-md cursor-pointer">Volver al inicio de sesión</Button>
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
