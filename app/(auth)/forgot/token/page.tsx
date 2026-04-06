"use client"

import { SubmitHandler, useForm, Controller } from "react-hook-form";
import {
    Input, Toaster, Button, Label
} from "@/components/index";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import Link from "next/link";

interface TokenFormInouts {
    token: string;
}

export default function TokenPage() {
    const {
        register, handleSubmit, control, formState: { errors }
    } = useForm<TokenFormInouts>(
        {
            defaultValues: {
                token: ""
            }
        }
    );

    const onSubmit: SubmitHandler<TokenFormInouts> = (data) => {
        console.log(data);
        toast.success("Confirmacion de token exitosa");
    };

    const onError = () => {
        if (errors.token) {
            toast.error(errors.token.message);
        }
    };

    return (
        <form action="" onSubmit={handleSubmit(onSubmit, onError)}>
            <Toaster position="top-center" richColors />
            <Label htmlFor="token">Ingresa el código que enviamos a tu correo</Label>
            <Controller
                name="token"
                control={control}
                rules={
                    {
                        required: "El token es obligatorio",
                        minLength: { value: 6, message: "El token debe tener 6 dígitos" }
                    }
                }
                render={({ field }) => (
                    <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSeparator />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSeparator />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                )}
            >
            </Controller>

            <Button type="submit" className="cursor-pointer">Validar Token</Button>
        </form>
    );
}