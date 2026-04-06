"use client"

import { SubmitHandler, useForm } from "react-hook-form";
import {
    Input, Toaster, Button, Label
} from "@/components/index";
import { toast } from "sonner";
import Link from "next/link";

interface RegisterFormInouts {
    name: string;
    father_lastname: string;
    mother_lastname: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInouts>();

    const onSubmit: SubmitHandler<RegisterFormInouts> = (data) => {
        console.log(data);
        toast.success("Registro exitoso");
    };

    const onError = () => {
        if (errors.name) {
            toast.error(errors.name.message);
        } else if (errors.father_lastname) {
            toast.error(errors.father_lastname.message);
        } else if (errors.mother_lastname) {
            toast.error(errors.mother_lastname.message);
        } else if (errors.username) {
            toast.error(errors.username.message);
        } else if (errors.email) {
            toast.error(errors.email.message);
        } else if (errors.password) {
            toast.error(errors.password.message);
        } else if (errors.confirm_password) {
            toast.error(errors.confirm_password.message);
        }
    };

    return (
        <form action="" onSubmit={handleSubmit(onSubmit, onError)}>
            <Toaster position="top-center" richColors />
            <Label htmlFor="name">Nombre</Label>
            <Input
                type="text"
                id="name"
                {... (register("name", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu nombre",
                    },
                }))}
            ></Input>

            <Label htmlFor="father_lastname">Apellido Paterno</Label>
            <Input
                type="text"
                id="father_lastname"
                {... (register("father_lastname", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu apellido paterno",
                    },
                }))}
            ></Input>

            <Label htmlFor="mother_lastname">Apellido Materno</Label>
            <Input
                type="text"
                id="mother_lastname"
                {... (register("mother_lastname", {
                    required: {
                        value: false,
                        message: "Necesitas ingresar tu apellido materno",
                    },
                }))}
            ></Input>

            <Label htmlFor="username">Username</Label>
            <Input
                type="text"
                id="username"
                {... (register("username", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar un nombre de usuario",
                    },
                }))}
            ></Input>

            <Label htmlFor="email">Correo</Label>
            <Input
                type="email"
                id="email"
                {... (register("email", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu correo",
                    },
                }))}
            ></Input>

            <Label htmlFor="password">Contraseña</Label>
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

            <Label htmlFor="confirm_password">Confirmar contraseña</Label>
            <Input
                type="password"
                id="confirm_password"
                {... (register("confirm_password", {
                    required: {
                        value: true,
                        message: "Necesitas ingresar tu contraseña de nuevo para confirmarla",
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

            <Link href="/login">
                <span>¿Ya tienes una cuenta? </span>
                <Button variant="link" className="cursor-pointer">Inicia sesión</Button>
            </Link>

            <Button type="submit" className="cursor-pointer">Registrarse</Button>
        </form>
    );
}