/* ═══════════════════════════════════════════════════════════════════════════
 * Board2D — Tablero interactivo 2D para TileKick
 *
 * Grid de 10 filas × 5 columnas con celdas CUADRADAS:
 *   - Fila 0:   portería HOME (solo cols 1-3)
 *   - Filas 1-8: campo de juego
 *   - Fila 9:   portería AWAY (solo cols 1-3)
 *
 * El tablero calcula su tamaño según el contenedor disponible,
 * asegurando que cada celda sea cuadrada y suficientemente grande.
 * ═══════════════════════════════════════════════════════════════════════════ */

"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { PlayerSide, PieceRole } from "@/lib/enums"
import { BOARD_ROWS, BOARD_COLS, GOAL_COL_START, GOAL_COLS, GOAL_ROW_HOME, GOAL_ROW_AWAY } from "@/lib/game/constants"
import type { GameState, Piece, Pos, Cell } from "@/lib/game/types"
import type { PendingShoot } from "@/hooks/use-local-game"

/* ── Props ────────────────────────────────────────────────────────────── */

export interface Board2DProps {
    gameState: GameState
    selectedPiece: Piece | null
    legalMoves: Pos[]
    passTargets: Piece[]
    stealTargets: Piece[]
    pendingShoot: PendingShoot | null
    cancha: string
    onCellClick: (pos: Pos) => void
    onPieceClick: (pieceId: string) => void
    onGoalColClick?: (col: number) => void
}

/* ── Colores de cancha ────────────────────────────────────────────────── */

const CANCHA_COLORS: Record<string, [string, string]> = {
    clasica:  ["#769656", "#eeeed2"],
    oceano:   ["#4a90a4", "#d6ecf3"],
    noche:    ["#4a4a6a", "#b0b0d0"],
    amanecer: ["#c07850", "#f5deb3"],
    bosque:   ["#3a5f3a", "#c8dbb8"],
    neon:     ["#00b4d8", "#0077b6"],
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function isGoalCell(row: number, col: number): boolean {
    return (row === GOAL_ROW_HOME || row === GOAL_ROW_AWAY) &&
        col >= GOAL_COL_START && col < GOAL_COL_START + GOAL_COLS
}

function isOutsideGoal(row: number, col: number): boolean {
    return (row === GOAL_ROW_HOME || row === GOAL_ROW_AWAY) && !isGoalCell(row, col)
}

function pieceEmoji(role: PieceRole): string {
    switch (role) {
        case PieceRole.GOALKEEPER: return "🧤"
        case PieceRole.DEFENDER:   return "🛡️"
        case PieceRole.FORWARD:    return "⚡"
    }
}

function roleLabel(role: PieceRole): string {
    switch (role) {
        case PieceRole.GOALKEEPER: return "POR"
        case PieceRole.DEFENDER:   return "DEF"
        case PieceRole.FORWARD:    return "DEL"
    }
}

/* ── Componente de pieza ──────────────────────────────────────────────── */

function PieceToken({
    piece,
    isSelected,
    isPassTarget,
    isStealTarget,
    cellSize,
}: {
    piece: Piece
    isSelected: boolean
    isPassTarget: boolean
    isStealTarget: boolean
    cellSize: number
}) {
    const isHome = piece.side === PlayerSide.HOME
    const suspended = piece.suspendedTurns > 0
    const tokenSize = Math.max(cellSize * 0.78, 20)
    const fontSize = Math.max(cellSize * 0.32, 10)
    const labelSize = Math.max(cellSize * 0.16, 7)
    const badgeSize = Math.max(cellSize * 0.22, 10)

    return (
        <div
            className={cn(
                "rounded-full flex flex-col items-center justify-center",
                "font-bold transition-all duration-150 select-none",
                "ring-2 shadow-md cursor-pointer z-10",
                isHome
                    ? "bg-blue-500 text-white ring-blue-300"
                    : "bg-red-500 text-white ring-red-300",
                isSelected && "ring-4 ring-yellow-400 scale-110 z-20 shadow-yellow-400/50 shadow-lg",
                isPassTarget && "ring-4 ring-green-400 animate-pulse",
                isStealTarget && "ring-4 ring-orange-400 animate-pulse",
                suspended && "opacity-40 grayscale",
            )}
            style={{ width: tokenSize, height: tokenSize }}
        >
            <span style={{ fontSize, lineHeight: 1 }}>{pieceEmoji(piece.role)}</span>
            <span style={{ fontSize: labelSize, lineHeight: 1, marginTop: 2 }}>{roleLabel(piece.role)}</span>

            {/* Indicador de balón */}
            {piece.hasBall && (
                <div
                    className="absolute bg-yellow-300 rounded-full border border-yellow-600 flex items-center justify-center z-20 shadow-sm"
                    style={{
                        width: badgeSize,
                        height: badgeSize,
                        top: -badgeSize * 0.25,
                        right: -badgeSize * 0.25,
                        fontSize: badgeSize * 0.6,
                    }}
                >
                    ⚽
                </div>
            )}

            {/* Tarjetas amarillas */}
            {piece.yellowCards > 0 && (
                <div
                    className="absolute bg-yellow-400 rounded-sm border border-yellow-700 text-yellow-900 flex items-center justify-center font-black z-20"
                    style={{
                        width: badgeSize * 0.75,
                        height: badgeSize,
                        top: -badgeSize * 0.25,
                        left: -badgeSize * 0.2,
                        fontSize: badgeSize * 0.5,
                    }}
                >
                    {piece.yellowCards}
                </div>
            )}

            {/* Suspensión (roja) */}
            {suspended && (
                <div
                    className="absolute bg-red-700 text-white rounded-full z-20 flex items-center justify-center"
                    style={{
                        bottom: -badgeSize * 0.2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: badgeSize * 0.5,
                        padding: "0 3px",
                        minWidth: badgeSize,
                        height: badgeSize * 0.7,
                    }}
                >
                    {piece.suspendedTurns}t
                </div>
            )}
        </div>
    )
}

/* ── Hook para medir el contenedor ────────────────────────────────────── */

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                setSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })

        observer.observe(el)
        // Medición inicial
        setSize({ width: el.clientWidth, height: el.clientHeight })

        return () => observer.disconnect()
    }, [ref])

    return size
}

/* ── Componente principal ─────────────────────────────────────────────── */

export default function Board2D({
    gameState,
    selectedPiece,
    legalMoves,
    passTargets,
    stealTargets,
    pendingShoot,
    cancha,
    onCellClick,
    onPieceClick,
    onGoalColClick,
}: Board2DProps) {
    const [dark, light] = CANCHA_COLORS[cancha] ?? CANCHA_COLORS.clasica
    const containerRef = useRef<HTMLDivElement>(null)
    const containerSize = useContainerSize(containerRef)

    // Calcular tamaño de celda cuadrada que quepa en el contenedor
    const cellSize = useMemo(() => {
        if (containerSize.width === 0 || containerSize.height === 0) return 50
        const cellByWidth  = Math.floor(containerSize.width / BOARD_COLS)
        const cellByHeight = Math.floor(containerSize.height / BOARD_ROWS)
        return Math.max(Math.min(cellByWidth, cellByHeight), 30)
    }, [containerSize])

    const boardWidth  = cellSize * BOARD_COLS
    const boardHeight = cellSize * BOARD_ROWS

    // Mapa de posición → pieza
    const pieceMap = useMemo(() => {
        const map = new Map<string, Piece>()
        for (const p of gameState.pieces) {
            map.set(`${p.pos.row},${p.pos.col}`, p)
        }
        return map
    }, [gameState.pieces])

    // Set de posiciones legales
    const legalSet = useMemo(
        () => new Set(legalMoves.map((m) => `${m.row},${m.col}`)),
        [legalMoves],
    )

    // Sets de IDs para resaltado
    const passTargetIds = useMemo(
        () => new Set(passTargets.map((p) => p.id)),
        [passTargets],
    )
    const stealTargetIds = useMemo(
        () => new Set(stealTargets.map((p) => p.id)),
        [stealTargets],
    )

    // Portería objetivo del disparo pendiente
    const actualShootGoalRow = useMemo(() => {
        if (!pendingShoot) return null
        const shooterPiece = gameState.pieces.find(p => p.id === pendingShoot.action.pieceId)
        return shooterPiece?.side === PlayerSide.HOME ? GOAL_ROW_AWAY : GOAL_ROW_HOME
    }, [pendingShoot, gameState.pieces])

    /* ── Render celdas ────────────────────────────────────────────── */

    const cells: React.ReactNode[] = []

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const key = `${row},${col}`
            const outside = isOutsideGoal(row, col)
            const goal = isGoalCell(row, col)
            const cell: Cell = gameState.grid[row][col]
            const piece = pieceMap.get(key)
            const isLegal = legalSet.has(key)
            const isSelected = selectedPiece?.pos.row === row && selectedPiece?.pos.col === col

            // Celdas fuera de portería = vacías oscuras
            if (outside) {
                cells.push(
                    <div
                        key={key}
                        className="bg-background/80"
                        style={{ width: cellSize, height: cellSize }}
                    />
                )
                continue
            }

            const isDarkTile = (row + col) % 2 === 1
            const baseBg = goal
                ? "transparent"
                : (isDarkTile ? dark : light)

            const heightOpacity = goal ? 1 : Math.max(0.2, cell.height / 3)
            const isGoalOption = pendingShoot && actualShootGoalRow === row && goal

            const handleClick = () => {
                if (isGoalOption && onGoalColClick) {
                    onGoalColClick(col)
                    return
                }
                if (piece) {
                    onPieceClick(piece.id)
                } else if (isLegal) {
                    onCellClick({ row, col })
                }
            }

            cells.push(
                <div
                    key={key}
                    className={cn(
                        "relative flex items-center justify-center select-none",
                        "transition-all duration-100 border border-black/5",
                        (isLegal || piece || isGoalOption) && "cursor-pointer",
                    )}
                    style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: baseBg,
                        opacity: heightOpacity,
                    }}
                    onClick={handleClick}
                >
                    {/* Portería: fondo con color de equipo */}
                    {goal && (
                        <div className={cn(
                            "absolute inset-0 border-2",
                            row === GOAL_ROW_HOME
                                ? "border-blue-400/60 bg-blue-500/15"
                                : "border-red-400/60 bg-red-500/15",
                        )} />
                    )}

                    {/* Celda destruida */}
                    {!goal && cell.height === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-muted-foreground/40" style={{ fontSize: cellSize * 0.25 }}>✕</span>
                        </div>
                    )}

                    {/* Movimiento legal */}
                    {isLegal && !piece && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div
                                className="rounded-full bg-yellow-400/60 animate-pulse"
                                style={{ width: cellSize * 0.3, height: cellSize * 0.3 }}
                            />
                        </div>
                    )}

                    {/* Opción de portería para shoot */}
                    {isGoalOption && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-emerald-400/25 border-2 border-emerald-400 animate-pulse">
                            <span style={{ fontSize: cellSize * 0.45 }}>🧤</span>
                        </div>
                    )}

                    {/* Pieza */}
                    {piece && (
                        <PieceToken
                            piece={piece}
                            isSelected={isSelected}
                            isPassTarget={passTargetIds.has(piece.id)}
                            isStealTarget={stealTargetIds.has(piece.id)}
                            cellSize={cellSize}
                        />
                    )}

                    {/* Indicador de altura (sutil) */}
                    {!goal && cell.height < 3 && cell.height > 0 && (
                        <span
                            className="absolute text-black/15 font-mono"
                            style={{
                                bottom: 1,
                                right: 3,
                                fontSize: Math.max(cellSize * 0.15, 7),
                            }}
                        >
                            {cell.height}
                        </span>
                    )}
                </div>
            )
        }
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
        >
            <div
                className="rounded-xl overflow-hidden shadow-2xl border-2 border-border/50"
                style={{ width: boardWidth, height: boardHeight }}
            >
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `repeat(${BOARD_COLS}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${BOARD_ROWS}, ${cellSize}px)`,
                    }}
                >
                    {cells}
                </div>
            </div>
        </div>
    )
}
