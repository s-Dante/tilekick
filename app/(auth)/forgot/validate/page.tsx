"use client"

import { SubmitHandler, useForm } from "react-hook-form";
import {
    Input, Toaster, Button, Label
} from "@/components/index";
import { toast } from "sonner";
import Link from "next/link";

interface ValidateFormInouts {
    email: string;
}

export default function ValidatePage() {
    const { register, handleSubmit, formState: { errors } } = useForm<ValidateFormInouts>();

    const onSubmit: SubmitHandler<ValidateFormInouts> = (data) => {
        console.log(data);
        toast.success("Validacion y envio de correo exitosos");
    };

    const onError = () => {
        if (errors.email) {
            toast.error(errors.email.message);
        }
    };

    return (
        <form action="" onSubmit={handleSubmit(onSubmit, onError)}>
            <Toaster position="top-center" richColors />

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

            <Button type="submit" className="cursor-pointer">Validar Correo</Button>
        </form>
    );
}