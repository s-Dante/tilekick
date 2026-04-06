export const passwordRules = {
    required: "La contraseña es obligatoria",
    validate: {
        format: (v: string) =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d()\-_.!¡?¿*/[\]]{8,}$/.test(v)
            || "La contraseña no cumple con los requisitos de seguridad",
    }
};