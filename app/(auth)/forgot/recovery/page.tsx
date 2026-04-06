"use client"

import { SubmitHandler, useForm } from "react-hook-form";
import {
    Input, Toaster, Button, Label
} from "@/components/index";
import { toast } from "sonner";
import Link from "next/link";

interface RecoveryFormInouts {
    password: string;
    confirm_password: string;
}

export default function RecoveryPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<RecoveryFormInouts>();

    const onSubmit: SubmitHandler<RecoveryFormInouts> = (data) => {
        console.log(data);
        toast.success("Cambio de contraseña exitoso");
    };

    const onError = () => {
        if (errors.password) {
            toast.error(errors.password.message);
        } else if (errors.confirm_password) {
            toast.error(errors.confirm_password.message);
        }
    };

    return (
        <form action="" onSubmit={handleSubmit(onSubmit, onError)}>
            <Toaster position="top-center" richColors />
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
                type="password"
                id="password"
                {... (register("password", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu contraseña",
                    },
                    minLength: {
                        value: 8,
                        message: "La contraseña debe tener al menos 8 caracteres",
                    },
                    pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/,
                        message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                    },
                }))}
            ></Input>

            <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
            <Input
                type="password"
                id="confirm_password"
                {... (register("confirm_password", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu contraseña",
                    },
                    minLength: {
                        value: 8,
                        message: "La contraseña debe tener al menos 8 caracteres",
                    },
                    pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/,
                        message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                    },
                }))}
            ></Input>

            <Button type="submit" className="cursor-pointer">Cambiar contraseña</Button>
        </form>
    );
}