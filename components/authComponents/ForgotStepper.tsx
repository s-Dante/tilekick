import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
    "Validar correo",
    "Código de verificación",
    "Nueva contraseña",
];

interface ForgotStepperProps {
    currentStep: 1 | 2 | 3;
}

export default function ForgotStepper({ currentStep }: ForgotStepperProps) {
    return (
        <div className="flex items-start w-full">
            {STEPS.map((label, i) => {
                const step = i + 1;
                const isDone = step < currentStep;
                const isActive = step === currentStep;

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* Círculo + etiqueta */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={cn(
                                "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors",
                                isDone
                                    ? "bg-primary/10 border-primary/50 text-primary"
                                    : isActive
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "bg-background border-border text-muted-foreground"
                            )}>
                                {isDone ? <Check className="w-3.5 h-3.5" /> : step}
                            </div>
                            <span className={cn(
                                "text-xs text-center leading-tight max-w-[70px]",
                                isActive ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                                {label}
                            </span>
                        </div>

                        {/* Línea conectora */}
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "flex-1 h-px mx-2 mb-5 transition-colors",
                                isDone ? "bg-primary/40" : "bg-border"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
