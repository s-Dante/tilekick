"use client"

import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input, Toaster, Button, Label } from "@/components/index"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotStepper from "@/components/authComponents/ForgotStepper"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

interface RecoveryFormInputs {
    password: string
    confirm_password: string
}

export default function RecoveryPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const resetId = searchParams.get("resetId") ?? ""
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RecoveryFormInputs>()

    const onSubmit: SubmitHandler<RecoveryFormInputs> = async (data) => {
        if (!resetId) {
            toast.error("Token de recuperación no encontrado. Inicia el proceso de nuevo.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/forgot/recovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetId, ...data }),
            })

            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? "Error al cambiar la contraseña")
                return
            }

            toast.success("Contraseña actualizada. Ahora puedes iniciar sesión.")
            router.push("/login")
        } catch {
            toast.error("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const onError = () => {
        const firstError = Object.values(errors)[0]
        if (firstError?.message) toast.error(firstError.message)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-4">
                <ForgotStepper currentStep={3} />
                <div>
                    <CardTitle className="text-3xl">Nueva contraseña</CardTitle>
                    <CardDescription className="mt-1 text-lg">
                        Elige una contraseña segura para tu cuenta
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Toaster position="top-center" richColors />

                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Nueva contraseña</Label>
                        <Input
                            type="password" id="password" disabled={loading}
                            {...register("password", {
                                required: { value: true, message: "Necesitas ingresar tu contraseña" },
                                minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/,
                                    message: "Debe contener mayúscula, minúscula, número y carácter especial",
                                },
                            })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                        <Input
                            type="password" id="confirm_password" disabled={loading}
                            {...register("confirm_password", {
                                required: { value: true, message: "Confirma tu contraseña" },
                                validate: (val) =>
                                    val === watch("password") || "Las contraseñas no coinciden",
                            })}
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" className="w-full cursor-pointer text-xl mt-8" disabled={loading}>
                        {loading ? "Cambiando..." : "Cambiar contraseña"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
