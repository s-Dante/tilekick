import Link from "next/link";
import { Button, TitleAndSlogan, FeaturedCard, LandingModelWrapper } from "@/components/index";
import { UsersRound, Globe, GlobeOff, UserRound, Bot, Earth, ChartColumnIncreasing } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-20 flex flex-col gap-16 justify-items-center">

        <section className="text-start">
          <TitleAndSlogan title='TileKick' slogan='¡Arma tu estrategia y gana el torneo!' />
        </section>

        <section>
          <Link href="/login">
            <Button variant="default" size="2xl" className="cursor-pointer">¡Juega ahora!</Button>
          </Link>
        </section>

        <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <FeaturedCard
            icon1={<UsersRound className="h-8 w-8" />}
            icon2={<Globe className="h-8 w-8" />}
            title="Multijugador Online"
            content="Compite contra jugadores de todo el mundo en tiempo real"
          />
          <FeaturedCard
            icon1={<UsersRound className="h-8 w-8" />}
            icon2={<GlobeOff className="h-8 w-8" />}
            title="Multijugador Local"
            content="Disfruta de una partida clásica con amigos en el mismo lugar"
          />
          <FeaturedCard
            icon1={<UserRound className="h-8 w-8" />}
            icon2={<Bot className="h-8 w-8" />}
            title="Tú VS IA"
            content="Juega contra la IA para mejorar tus habilidades"
          />
          <FeaturedCard
            icon1={<ChartColumnIncreasing className="h-8 w-8" />}
            icon2={<Earth className="h-8 w-8" />}
            title="Ranking Mundial"
            content="Sube en la tabla y demuestra que eres el mejor kicker"
          />
        </section>

        <LandingModelWrapper />

      </main>
    </div>
  );
}
