"use client"

import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input, Toaster, Button, Label } from "@/components/index"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LoginFormInputs {
    identification: string
    password: string
}

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>()

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? "Error al iniciar sesión")
                return
            }

            toast.success("¡Bienvenido de vuelta!")
            window.location.href = "/home"
        } catch {
            toast.error("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const onError = () => {
        if (errors.identification) {
            toast.error(errors.identification.message)
        } else if (errors.password) {
            toast.error(errors.password.message)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-3xl">Iniciar sesión</CardTitle>
                <CardDescription className="text-base text-lg">Ingresa tus datos para acceder a tu cuenta</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Toaster position="top-center" richColors />

                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="identification">Correo o username</Label>
                        <Input
                            type="text"
                            id="identification"
                            disabled={loading}
                            {...register("identification", {
                                required: { value: true, message: "Necesitas ingresar tu correo o username" },
                            })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            <Link href="/forgot/validate">
                                <Button variant="link" className="h-auto p-0 text-sm cursor-pointer">
                                    ¿Olvidaste tu contraseña?
                                </Button>
                            </Link>
                        </div>
                        <Input
                            type="password"
                            id="password"
                            disabled={loading}
                            {...register("password", {
                                required: { value: true, message: "Necesitas ingresar tu contraseña" },
                            })}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 mt-8">
                    <Button type="submit" className="w-full cursor-pointer text-xl" disabled={loading}>
                        {loading ? "Ingresando..." : "Iniciar sesión"}
                    </Button>
                    <p className="text-md text-muted-foreground text-center">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register">
                            <Button variant="link" className="h-auto p-0 text-md cursor-pointer">Regístrate</Button>
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
