"use client"

import { SubmitHandler, useForm } from "react-hook-form";
import {
    Input, Toaster, Button, Label
} from "@/components/index";
import { toast } from "sonner";
import Link from "next/link";

interface LoginFormInouts {
    identification: string;
    password: string;
}

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInouts>();

    const onSubmit: SubmitHandler<LoginFormInouts> = (data) => {
        console.log(data);
        toast.success("Login exitoso");
    };

    const onError = () => {
        if (errors.identification) {
            toast.error(errors.identification.message);
        } else if (errors.password) {
            toast.error(errors.password.message);
        }
    };

    return (
        <form action="" onSubmit={handleSubmit(onSubmit, onError)}>
            <Toaster position="top-center" richColors />
            <Label htmlFor="identification">Correo o username</Label>
            <Input
                type="text"
                id="identification"
                {... (register("identification", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu correo o username",
                    },
                }))}
            ></Input>

            <Link href="/forgot/validate">
                <Button variant="link" className="cursor-pointer">¿Olvidaste tu contraseña?</Button>
            </Link>
            <Label htmlFor="password">Contraseña</Label>
            <Input
                type="password"
                id="password"
                {... (register("password", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu contraseña",
                    },
                }))}
            ></Input>

            <Link href="/register">
                <span>¿No tienes una cuenta? </span>
                <Button variant="link" className="cursor-pointer">Registrate</Button>
            </Link>

            <Button type="submit" className="cursor-pointer">Login</Button>
        </form>
    );
}