"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Users, Bot, Monitor, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MODES = [
    { id: "online",  title: "Online",  description: "Juega contra jugadores de todo el mundo", icon: Globe },
    { id: "local",   title: "Local",   description: "Juega con amigos en el mismo dispositivo", icon: Users },
    { id: "ia",      title: "VS IA",   description: "Entrena y mejora contra la inteligencia artificial", icon: Bot },
]

const CANCHAS = [
    { id: "clasica",  label: "Clásica",  colors: ["#769656", "#eeeed2"] },
    { id: "oceano",   label: "Océano",   colors: ["#4a90a4", "#d6ecf3"] },
    { id: "noche",    label: "Noche",    colors: ["#4a4a6a", "#b0b0d0"] },
    { id: "amanecer", label: "Amanecer", colors: ["#c07850", "#f5deb3"] },
    { id: "bosque",   label: "Bosque",   colors: ["#3a5f3a", "#c8dbb8"] },
    { id: "neon",     label: "Neon",     colors: ["#00b4d8", "#0077b6"] },
]

const RENDERS = [
    { id: "2d", label: "2D", icon: Monitor, desc: "Clásico y rápido" },
    { id: "3d", label: "3D", icon: Box,     desc: "Inmersivo y visual" },
]

function StepBadge({ n }: { n: number }) {
    return (
        <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground shrink-0">
            {n}
        </Badge>
    )
}

function SectionLabel({ n, label }: { n: number; label: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <StepBadge n={n} />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                {label}
            </span>
        </div>
    )
}

export default function PlayPage() {
    const router = useRouter()
    const [mode,   setMode]   = useState("online")
    const [cancha, setCancha] = useState("clasica")
    const [render, setRender] = useState("2d")

    function handlePlay() {
        const params = new URLSearchParams({ render, cancha })
        if (mode === "online") {
            router.push(`/play/online?${params}`)
        } else {
            params.set("mode", mode)
            router.push(`/play/game?${params}`)
        }
    }

    return (
        /* Ocupa toda la altura de la vista sin scroll */
        <div className="h-[calc(100vh-3rem)] flex flex-col px-8 py-6 max-w-2xl mx-auto">

            <h1 className="text-3xl font-bold shrink-0 mb-6">Jugar</h1>

            {/* ── Las 3 secciones se reparten el espacio disponible ──── */}
            <div className="flex-1 flex flex-col justify-between min-h-0">

                {/* Paso 1: Modo */}
                <section>
                    <SectionLabel n={1} label="Modo de juego" />
                    <div className="grid grid-cols-3 gap-3">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={cn(
                                    "text-left rounded-xl border-2 px-4 py-4 transition-all",
                                    "hover:border-primary/60 hover:bg-primary/5",
                                    mode === m.id ? "border-primary bg-primary/10" : "border-border bg-card"
                                )}
                            >
                                <m.icon className={cn("h-5 w-5 mb-2", mode === m.id ? "text-primary" : "text-muted-foreground")} />
                                <p className="font-semibold text-sm">{m.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Paso 2: Cancha */}
                <section>
                    <SectionLabel n={2} label="Cancha" />
                    <div className="flex flex-wrap gap-2">
                        {CANCHAS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCancha(c.id)}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all",
                                    "hover:border-primary/60 hover:bg-primary/5",
                                    cancha === c.id ? "border-primary bg-primary/10" : "border-border bg-card"
                                )}
                            >
                                <div className="h-6 w-6 rounded-sm overflow-hidden grid grid-cols-2 shrink-0">
                                    <div style={{ backgroundColor: c.colors[1] }} />
                                    <div style={{ backgroundColor: c.colors[0] }} />
                                    <div style={{ backgroundColor: c.colors[0] }} />
                                    <div style={{ backgroundColor: c.colors[1] }} />
                                </div>
                                <span className={cn("text-xs font-medium whitespace-nowrap", cancha === c.id ? "text-primary" : "text-foreground")}>
                                    {c.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Paso 3: Render */}
                <section>
                    <SectionLabel n={3} label="Visualización" />
                    <div className="grid grid-cols-2 gap-3">
                        {RENDERS.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRender(r.id)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left",
                                    "hover:border-primary/60 hover:bg-primary/5",
                                    render === r.id ? "border-primary bg-primary/10" : "border-border bg-card"
                                )}
                            >
                                <r.icon className={cn("h-5 w-5 shrink-0", render === r.id ? "text-primary" : "text-muted-foreground")} />
                                <div>
                                    <p className="font-semibold text-sm">{r.label}</p>
                                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Botón */}
                <Button size="lg" className="w-full font-bold h-11" onClick={handlePlay}>
                    {mode === "online" ? "Buscar partida" : "Jugar"}
                </Button>

            </div>
        </div>
    )
}
