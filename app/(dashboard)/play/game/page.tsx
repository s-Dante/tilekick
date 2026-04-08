"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Flag, RotateCcw, RefreshCcw, Crosshair } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PlayerSide, PieceRole } from "@/lib/enums"
import { GOAL_COL_START, GOAL_COLS } from "@/lib/game/constants"
import { useLocalGame } from "@/hooks/use-local-game"
import Board2D from "@/components/gameComponents/Board2D"
import type { Pos } from "@/lib/game/types"

/* ── Datos placeholder de jugadores ──────────────────────────────────── */

const PLAYER_HOME = { name: "Jugador 1", username: "player1", rank: "Local", avatar: "" }
const PLAYER_AWAY = { name: "Jugador 2", username: "player2", rank: "Local", avatar: "" }

/* ── Colores de cancha (para el badge) ───────────────────────────────── */

const CANCHA_LABELS: Record<string, string> = {
    clasica: "Clasica", oceano: "Oceano", noche: "Noche",
    amanecer: "Amanecer", bosque: "Bosque", neon: "Neon",
}

/* ── Panel de jugador ────────────────────────────────────────────────── */

function PlayerPanel({
    player,
    side,
    score,
    active,
}: {
    player: typeof PLAYER_HOME
    side: PlayerSide
    score: number
    active: boolean
}) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors shrink-0",
            active ? "border-primary/60 bg-primary/5" : "border-border bg-card/60"
        )}>
            <Avatar className="h-9 w-9 rounded-lg shrink-0">
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className={cn(
                    "rounded-lg text-sm font-bold",
                    side === PlayerSide.HOME
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400",
                )}>
                    {player.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                    {side === PlayerSide.HOME ? "HOME" : "AWAY"}
                </p>
            </div>
            <Badge variant={side === PlayerSide.HOME ? "default" : "destructive"} className="shrink-0 text-xs">
                {side === PlayerSide.HOME ? "🔵" : "🔴"}
            </Badge>
            <div className={cn(
                "font-mono text-xl font-bold tabular-nums px-3 py-1 rounded-lg min-w-[2.5rem] text-center",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
                {score}
            </div>
        </div>
    )
}

/* ── Barra de acciones de pieza ───────────────────────────────────────── */

function ActionBar({
    canShoot,
    hasPassTargets,
    hasStealTargets,
    pendingShoot,
    isFinished,
    onShoot,
    onCancelShoot,
}: {
    canShoot: boolean
    hasPassTargets: boolean
    hasStealTargets: boolean
    pendingShoot: boolean
    isFinished: boolean
    onShoot: () => void
    onCancelShoot: () => void
}) {
    if (isFinished) return null

    if (pendingShoot) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-sm text-emerald-300 flex-1">
                    🧤 Portero: elige columna de porteria para atajar
                </span>
                <Button size="sm" variant="ghost" onClick={onCancelShoot} className="text-xs">
                    Cancelar
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {canShoot && (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={onShoot}
                    className="gap-1.5 text-xs"
                >
                    <Crosshair className="h-3.5 w-3.5" />
                    Disparar (col central)
                </Button>
            )}
            {hasPassTargets && (
                <span className="text-xs text-muted-foreground">
                    Click en aliado para pasar
                </span>
            )}
            {hasStealTargets && (
                <span className="text-xs text-orange-400">
                    Click en rival con balon para robar
                </span>
            )}
        </div>
    )
}

/* ── Pagina principal del juego ───────────────────────────────────────── */

export default function GamePage() {
    const router       = useRouter()
    const searchParams = useSearchParams()

    const renderMode = searchParams.get("render") ?? "2d"
    const cancha     = searchParams.get("cancha") ?? "clasica"
    const mode       = searchParams.get("mode")   ?? "local"

    // ── Hook de juego local ──────────────────────────────────────────
    const game = useLocalGame()

    const {
        gameState,
        selectedPiece,
        legalMoves,
        passTargets,
        stealTargets,
        canShoot,
        pendingShoot,
        lastResult,
        message,
        selectPiece,
        clearSelection,
        moveToCell,
        pass,
        steal,
        shoot,
        confirmShoot,
        cancelShoot,
        restart,
    } = game

    const isFinished = gameState.result !== null

    /* ── Handlers del tablero ──────────────────────────────────────── */

    const handleCellClick = (pos: Pos) => {
        // Si hay movimiento legal, mover
        if (selectedPiece && legalMoves.some((m) => m.row === pos.row && m.col === pos.col)) {
            moveToCell(pos)
        }
    }

    const handlePieceClick = (pieceId: string) => {
        const piece = gameState.pieces.find((p) => p.id === pieceId)
        if (!piece) return

        // Si la pieza clickeada es un rival con balón y la pieza seleccionada puede robar
        if (
            selectedPiece &&
            piece.side !== gameState.turn &&
            piece.hasBall &&
            stealTargets.some((t) => t.id === pieceId)
        ) {
            steal(pieceId)
            return
        }

        // Si la pieza clickeada es aliada y la seleccionada tiene balón → pasar
        if (
            selectedPiece &&
            selectedPiece.hasBall &&
            piece.side === gameState.turn &&
            piece.id !== selectedPiece.id &&
            passTargets.some((t) => t.id === pieceId)
        ) {
            pass(pieceId)
            return
        }

        // Seleccionar / deseleccionar pieza propia
        selectPiece(pieceId)
    }

    const handleGoalColClick = (col: number) => {
        if (pendingShoot) {
            confirmShoot(col)
        }
    }

    const handleShoot = () => {
        // Disparar a columna central por defecto (el jugador puede elegir luego)
        shoot(2)
    }

    return (
        <div className="h-[calc(100vh-3rem)] flex flex-col p-3 gap-2 max-w-3xl mx-auto w-full">

            {/* Barra superior */}
            <div className="flex items-center justify-between shrink-0">
                <Button variant="ghost" size="sm" onClick={() => router.push("/play")} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Salir
                </Button>
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs font-mono uppercase">{renderMode}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{CANCHA_LABELS[cancha] ?? cancha}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                        {mode === "ia" ? "VS IA" : mode === "local" ? "Local" : "Online"}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono">
                        Turno {gameState.turnNumber}
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Reiniciar" onClick={restart}>
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Rendirse">
                        <Flag className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ofrecer tablas">
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Panel AWAY (arriba) */}
            <PlayerPanel
                player={PLAYER_AWAY}
                side={PlayerSide.AWAY}
                score={gameState.score.away}
                active={gameState.turn === PlayerSide.AWAY}
            />

            {/* Tablero — toma todo el espacio sobrante con overflow oculto */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Board2D
                    gameState={gameState}
                    selectedPiece={selectedPiece}
                    legalMoves={legalMoves}
                    passTargets={passTargets}
                    stealTargets={stealTargets}
                    pendingShoot={pendingShoot}
                    cancha={cancha}
                    onCellClick={handleCellClick}
                    onPieceClick={handlePieceClick}
                    onGoalColClick={handleGoalColClick}
                />
            </div>

            {/* Barra de acciones */}
            <ActionBar
                canShoot={canShoot}
                hasPassTargets={passTargets.length > 0 && selectedPiece?.hasBall === true}
                hasStealTargets={stealTargets.length > 0}
                pendingShoot={pendingShoot !== null}
                isFinished={isFinished}
                onShoot={handleShoot}
                onCancelShoot={cancelShoot}
            />

            {/* Mensaje de estado */}
            <div className={cn(
                "px-3 py-2 rounded-lg text-sm text-center shrink-0 transition-colors",
                isFinished
                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-semibold"
                    : lastResult && !lastResult.success
                        ? "bg-red-500/10 border border-red-500/20 text-red-300"
                        : lastResult?.meta?.goal
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold"
                            : "bg-muted/50 text-muted-foreground",
            )}>
                {message}
                {isFinished && (
                    <Button size="sm" variant="secondary" onClick={restart} className="ml-3 text-xs">
                        Nueva partida
                    </Button>
                )}
            </div>

            {/* Panel HOME (abajo) */}
            <PlayerPanel
                player={PLAYER_HOME}
                side={PlayerSide.HOME}
                score={gameState.score.home}
                active={gameState.turn === PlayerSide.HOME}
            />
        </div>
    )
}
