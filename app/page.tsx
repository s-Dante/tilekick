import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TitleAndSlogan, FeaturedCard, LandingModelWrapper } from "@/components/index";
import { UsersRound, Globe, GlobeOff, UserRound, Bot, Earth, ChartColumnIncreasing } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black uppercase tracking-widest text-primary">
            TileKick
          </span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
          {/* Fondo con gradiente radial sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
            {/* Texto hero */}
            <div className="flex flex-col gap-6">
              <TitleAndSlogan
                title="TileKick"
                slogan="¡Arma tu estrategia y gana el torneo!"
              />
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                El juego de estrategia de tiles más competitivo. Juega en 3D o
                en modo clásico 2D contra jugadores de todo el mundo.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/login">
                  <Button size="lg" className="px-8">¡Juega ahora!</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="px-8">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            </div>

            {/* Placeholder del modelo 3D */}
            <div className="w-full">
              <LandingModelWrapper />
            </div>
          </div>
        </section>

        {/* ── Features Section ─────────────────────────────────────────── */}
        <section className="py-24 border-t border-border/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3">¿Por qué TileKick?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Todo lo que necesitas para competir, mejorar y dominar el tablero.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <FeaturedCard
                icon1={<UsersRound className="h-6 w-6" />}
                icon2={<Globe className="h-6 w-6" />}
                title="Multijugador Online"
                content="Compite contra jugadores de todo el mundo en tiempo real"
              />
              <FeaturedCard
                icon1={<UsersRound className="h-6 w-6" />}
                icon2={<GlobeOff className="h-6 w-6" />}
                title="Multijugador Local"
                content="Disfruta de una partida clásica con amigos en el mismo lugar"
              />
              <FeaturedCard
                icon1={<UserRound className="h-6 w-6" />}
                icon2={<Bot className="h-6 w-6" />}
                title="Tú VS IA"
                content="Juega contra la IA para mejorar tus habilidades"
              />
              <FeaturedCard
                icon1={<ChartColumnIncreasing className="h-6 w-6" />}
                icon2={<Earth className="h-6 w-6" />}
                title="Ranking Mundial"
                content="Sube en la tabla y demuestra que eres el mejor kicker"
              />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© 2026 TileKick. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground transition-colors">Términos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
