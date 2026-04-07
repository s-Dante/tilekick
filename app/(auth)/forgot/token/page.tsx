"use client"

import { useState } from "react"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import { Toaster, Button, Label } from "@/components/index"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import ForgotStepper from "@/components/authComponents/ForgotStepper"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface TokenFormInputs {
    token: string
}

export default function TokenPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") ?? ""
    const [loading, setLoading] = useState(false)

    const { handleSubmit, control, formState: { errors } } = useForm<TokenFormInputs>({
        defaultValues: { token: "" },
    })

    const onSubmit: SubmitHandler<TokenFormInputs> = async (data) => {
        if (!email) {
            toast.error("Email no encontrado. Regresa al paso anterior.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/forgot/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token: data.token }),
            })

            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error ?? "Código inválido")
                return
            }

            toast.success("Código verificado")
            router.push(`/forgot/recovery?resetId=${encodeURIComponent(json.resetId)}`)
        } catch {
            toast.error("Error de conexión con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const onError = () => {
        if (errors.token) toast.error(errors.token.message)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-4">
                <ForgotStepper currentStep={2} />
                <div>
                    <CardTitle className="text-3xl">Verificar código</CardTitle>
                    <CardDescription className="mt-1 text-lg">
                        Ingresa el código de 6 dígitos que enviamos a tu correo
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Toaster position="top-center" richColors />

                <CardContent>
                    <div className="space-y-1.5">
                        <Label htmlFor="token">Código de verificación</Label>
                        <div className="flex justify-center pt-2">
                            <Controller
                                name="token"
                                control={control}
                                rules={{
                                    required: "El token es obligatorio",
                                    minLength: { value: 6, message: "El token debe tener 6 dígitos" },
                                }}
                                render={({ field }) => (
                                    <InputOTP
                                        maxLength={6}
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={loading}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="h-12 w-12 text-2xl" />
                                            <InputOTPSlot index={1} className="h-12 w-12 text-2xl" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator className="mx-2" />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={2} className="h-12 w-12 text-2xl" />
                                            <InputOTPSlot index={3} className="h-12 w-12 text-2xl" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator className="mx-2" />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={4} className="h-12 w-12 text-2xl" />
                                            <InputOTPSlot index={5} className="h-12 w-12 text-2xl" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 mt-8">
                    <Button type="submit" className="w-full cursor-pointer text-xl" disabled={loading}>
                        {loading ? "Verificando..." : "Verificar código"}
                    </Button>
                    <p className="text-md text-muted-foreground text-center">
                        ¿No recibiste el código?{" "}
                        <Link href="/forgot/validate">
                            <Button variant="link" className="h-auto p-0 text-md cursor-pointer">Reenviar</Button>
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
