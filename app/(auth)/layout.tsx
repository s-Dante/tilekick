import { TitleAndSlogan } from "@/components/index";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">

            {/* Panel izquierdo — Brand */}
            <div className="flex flex-col items-center justify-center p-10 md:w-1/2 border-b md:border-b-0 md:border-r border-border/30 bg-muted/20">
                <TitleAndSlogan title="TileKick" slogan="¡Arma tu estrategia y gana el torneo!" />
            </div>

            {/* Panel derecho — Formulario */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                {children}
            </div>

        </div>
    );
}
