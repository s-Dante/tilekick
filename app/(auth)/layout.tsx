import { TitleAndSlogan } from "@/components/index";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <div>
                <section>
                    <TitleAndSlogan title="TileKick" slogan="¡Arma tu estrategia y gana el torneo!" />
                </section>
                <section>
                    {children}
                </section>
            </div>
        </main>
    );
}