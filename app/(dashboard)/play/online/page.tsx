"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const MESSAGES = [
    "Buscando oponente…",
    "Conectando con el servidor…",
    "Analizando jugadores disponibles…",
    "Casi listo…",
]

export default function MatchmakingPage() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const [msgIndex, setMsgIndex] = useState(0)

    /* Cicla los mensajes cada 2.5 s para dar sensación de actividad */
    useEffect(() => {
        const id = setInterval(() => {
            setMsgIndex((i) => (i + 1) % MESSAGES.length)
        }, 2500)
        return () => clearInterval(id)
    }, [])

    function handleCancel() {
        router.push("/play")
    }

    const render = searchParams.get("render") ?? "2d"
    const cancha = searchParams.get("cancha") ?? "clasica"

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 min-h-[60vh]">

            {/* Spinner animado */}
            <div className="relative flex items-center justify-center">
                {/* Anillo exterior */}
                <div className="absolute h-28 w-28 rounded-full border-4 border-primary/20" />
                <div className="absolute h-28 w-28 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                {/* Anillo interior */}
                <div className="absolute h-16 w-16 rounded-full border-4 border-primary/10" />
                <div
                    className="absolute h-16 w-16 rounded-full border-4 border-transparent border-t-primary/60 animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                />
                <Loader2 className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: "1.5s" }} />
            </div>

            {/* Textos */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Buscando partida</h2>
                <p className="text-muted-foreground text-sm transition-all duration-500">
                    {MESSAGES[msgIndex]}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Modo {render.toUpperCase()} · Cancha {cancha.charAt(0).toUpperCase() + cancha.slice(1)}
                </p>
            </div>

            {/* Cancelar */}
            <Button variant="outline" onClick={handleCancel} className="mt-2">
                Cancelar búsqueda
            </Button>
        </div>
    )
}
