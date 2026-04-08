"use client"

import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Input, Toaster, Button, Label } from "@/components/index"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface RegisterFormInputs {
    name: string
    father_lastname: string
    mother_lastname: string
    username: string
    email: string
    password: string
    confirm_password: string
}

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormInputs>()

    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
        setLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? "Error al registrarse")
                return
            }

            toast.success("¡Cuenta creada exitosamente!")
            window.location.href = "/home"
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
            <CardHeader>
                <CardTitle className="text-3xl">Crear cuenta</CardTitle>
                <CardDescription className="text-lg">Completa tus datos para registrarte</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Toaster position="top-center" richColors />

                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            type="text" id="name" disabled={loading}
                            {...register("name", {
                                required: { value: true, message: "Necesitas ingresar tu nombre" },
                            })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="father_lastname">Ap. Paterno</Label>
                            <Input
                                type="text" id="father_lastname" disabled={loading}
                                {...register("father_lastname", {
                                    required: { value: true, message: "Necesitas ingresar tu apellido paterno" },
                                })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mother_lastname">Ap. Materno</Label>
                            <Input
                                type="text" id="mother_lastname" disabled={loading}
                                {...register("mother_lastname", { required: false })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            type="text" id="username" disabled={loading}
                            {...register("username", {
                                required: { value: true, message: "Necesitas ingresar un nombre de usuario" },
                                pattern: {
                                    value: /^[a-zA-Z0-9_.]{3,20}$/,
                                    message: "Solo letras, números, _ y . (3-20 caracteres)",
                                },
                            })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Correo</Label>
                        <Input
                            type="email" id="email" disabled={loading}
                            {...register("email", {
                                required: { value: true, message: "Necesitas ingresar tu correo" },
                            })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Contraseña</Label>
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

                <CardFooter className="flex flex-col gap-3 mt-8">
                    <Button type="submit" className="w-full cursor-pointer text-xl" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Registrarse"}
                    </Button>
                    <p className="text-md text-muted-foreground text-center">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login">
                            <Button variant="link" className="h-auto p-0 text-md cursor-pointer">Inicia sesión</Button>
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
