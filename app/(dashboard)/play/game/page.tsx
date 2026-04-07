"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Flag, RotateCcw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PLAYER = { name: "Dante Omar", username: "dante_tk", rank: "Diamante", avatar: "/avatars/user.jpg" }
const RIVAL  = { name: "Carlos M.",  username: "carlosm",  rank: "Maestro",  avatar: "" }

const CANCHA_COLORS: Record<string, [string, string]> = {
    clasica:  ["#769656", "#eeeed2"],
    oceano:   ["#4a90a4", "#d6ecf3"],
    noche:    ["#4a4a6a", "#b0b0d0"],
    amanecer: ["#c07850", "#f5deb3"],
    bosque:   ["#3a5f3a", "#c8dbb8"],
    neon:     ["#00b4d8", "#0077b6"],
}

function useTimer(initial: number) {
    const [secs, setSecs] = useState(initial)
    useEffect(() => {
        const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
        return () => clearInterval(id)
    }, [])
    const m = String(Math.floor(secs / 60)).padStart(2, "0")
    const s = String(secs % 60).padStart(2, "0")
    return `${m}:${s}`
}

function PlayerPanel({ player, timer, active }: {
    player: typeof PLAYER
    timer: string
    active: boolean
}) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors shrink-0",
            active ? "border-primary/60 bg-primary/5" : "border-border bg-card/60"
        )}>
            <Avatar className="h-9 w-9 rounded-lg shrink-0">
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className="rounded-lg text-sm font-bold bg-primary/10 text-primary">
                    {player.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">@{player.username}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">{player.rank}</Badge>
            <div className={cn(
                "font-mono text-base font-bold tabular-nums px-3 py-1 rounded-lg min-w-[4rem] text-center",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
                {timer}
            </div>
        </div>
    )
}

/* El tablero ocupa el espacio que le sobre entre los paneles */
function Board2D({ cancha }: { cancha: string }) {
    const [dark, light] = CANCHA_COLORS[cancha] ?? CANCHA_COLORS.clasica
    const SIZE = 8
    return (
        /* Cuadrado que respeta el espacio disponible usando min() en JS-style via inline style */
        <div
            className="rounded-xl overflow-hidden shadow-2xl border border-border/40"
            style={{ width: "min(100%, 100%)", aspectRatio: "1 / 1", height: "100%" }}
        >
            <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
                {Array.from({ length: SIZE * SIZE }).map((_, i) => {
                    const row = Math.floor(i / SIZE)
                    const col = i % SIZE
                    const isDark = (row + col) % 2 === 1
                    return (
                        <div
                            key={i}
                            style={{ backgroundColor: isDark ? dark : light }}
                            className="hover:brightness-110 transition-[filter] duration-100 cursor-pointer"
                        />
                    )
                })}
            </div>
        </div>
    )
}

function Board3D({ cancha }: { cancha: string }) {
    const [dark, light] = CANCHA_COLORS[cancha] ?? CANCHA_COLORS.clasica
    return (
        <div
            className="rounded-xl border border-border/40 shadow-2xl flex flex-col items-center justify-center gap-3"
            style={{
                aspectRatio: "1 / 1",
                height: "100%",
                background: `radial-gradient(ellipse at center, ${dark}33 0%, transparent 70%)`,
                backgroundColor: "hsl(var(--card))"
            }}
        >
            <div className="w-32 h-32 grid grid-cols-4 gap-0.5 opacity-60" style={{ transform: "rotateX(45deg) rotateZ(45deg)" }}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-sm"
                        style={{ backgroundColor: (Math.floor(i / 4) + i) % 2 === 1 ? dark : light }}
                    />
                ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Vista 3D — próximamente</p>
            <p className="text-xs text-muted-foreground/60">
                Requiere <code className="bg-muted px-1 rounded">@react-three/fiber</code>
            </p>
        </div>
    )
}

export default function GamePage() {
    const router       = useRouter()
    const searchParams = useSearchParams()

    const renderMode = searchParams.get("render") ?? "2d"
    const cancha     = searchParams.get("cancha") ?? "clasica"
    const mode       = searchParams.get("mode")   ?? "online"

    const [activePlayer] = useState<"player" | "rival">("player")
    const playerTimer = useTimer(600)
    const rivalTimer  = useTimer(600)

    return (
        <div className="h-[calc(100vh-3rem)] flex flex-col p-3 gap-2 max-w-2xl mx-auto w-full">

            {/* Barra superior */}
            <div className="flex items-center justify-between shrink-0">
                <Button variant="ghost" size="sm" onClick={() => router.push("/play")} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Salir
                </Button>
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs font-mono uppercase">{renderMode}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{cancha}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                        {mode === "ia" ? "VS IA" : mode === "local" ? "Local" : "Online"}
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Rendirse">
                        <Flag className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ofrecer tablas">
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Panel rival */}
            <PlayerPanel player={RIVAL}  timer={rivalTimer}  active={activePlayer === "rival"}  />

            {/* Tablero — toma todo el espacio sobrante, siempre cuadrado */}
            <div className="flex-1 min-h-0 flex items-center justify-center py-1">
                {renderMode === "3d" ? <Board3D cancha={cancha} /> : <Board2D cancha={cancha} />}
            </div>

            {/* Panel jugador */}
            <PlayerPanel player={PLAYER} timer={playerTimer} active={activePlayer === "player"} />

        </div>
    )
}
