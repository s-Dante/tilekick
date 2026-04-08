/* ═══════════════════════════════════════════════════════════════════════════
 * useLocalGame — Hook de React para el modo local (2 jugadores, 1 pantalla)
 *
 * Envuelve el GameEngine y expone:
 *   - estado reactivo del juego (gameState)
 *   - pieza seleccionada + movimientos legales resaltados
 *   - métodos: selectPiece, moveToCell, pass, steal, shoot, confirmShoot
 *   - flujo de SHOOT en 2 fases (pendingShoot → confirmShoot)
 *   - reinicio de partida
 * ═══════════════════════════════════════════════════════════════════════════ */

"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { GameEngine } from "@/lib/game/engine"
import { PlayerSide, PieceRole } from "@/lib/enums"
import type { GameState, Piece, Pos, ActionResult, ShootAction } from "@/lib/game/types"

/* ── Tipos del hook ───────────────────────────────────────────────────── */

export interface PendingShoot {
    action: ShootAction
    /** El defensor debe elegir columna para el portero */
    awaitingGoalkeeper: true
}

export interface UseLocalGameReturn {
    /** Estado completo del juego (reactivo) */
    gameState: GameState
    /** Pieza actualmente seleccionada (null si ninguna) */
    selectedPiece: Piece | null
    /** Posiciones legales para la pieza seleccionada */
    legalMoves: Pos[]
    /** Piezas aliadas a las que puede pasar (si tiene balón) */
    passTargets: Piece[]
    /** Piezas rivales adyacentes a las que puede robar */
    stealTargets: Piece[]
    /** true si la pieza seleccionada puede disparar */
    canShoot: boolean
    /** Shoot pendiente que espera respuesta del portero */
    pendingShoot: PendingShoot | null
    /** Último resultado de acción */
    lastResult: ActionResult | null
    /** Mensaje de feedback para la UI */
    message: string

    /* ── Acciones ──────────────────────────────────────────────────── */

    /** Selecciona una pieza propia (o deselecciona si ya está seleccionada) */
    selectPiece: (pieceId: string) => void
    /** Deselecciona la pieza actual */
    clearSelection: () => void
    /** Mueve la pieza seleccionada a la celda destino */
    moveToCell: (to: Pos) => void
    /** Pasa el balón a un aliado */
    pass: (targetId: string) => void
    /** Intenta robar el balón a un rival adyacente */
    steal: (targetId: string) => void
    /** Inicia disparo (fase 1: elige columna de portería) */
    shoot: (targetCol: number) => void
    /** Respuesta del portero (fase 2: elige columna donde lanzarse) */
    confirmShoot: (goalkeeperCol: number) => void
    /** Cancela el shoot pendiente */
    cancelShoot: () => void
    /** Reinicia la partida completa */
    restart: () => void
}

/* ── Hook ─────────────────────────────────────────────────────────────── */

export function useLocalGame(): UseLocalGameReturn {
    const engineRef = useRef<GameEngine | null>(null)

    // Inicializar engine una sola vez
    if (!engineRef.current) {
        const engine = new GameEngine()
        engine.init()
        engineRef.current = engine
    }

    const [gameState, setGameState] = useState<GameState>(() => engineRef.current!.getState())
    const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
    const [pendingShoot, setPendingShoot] = useState<PendingShoot | null>(null)
    const [lastResult, setLastResult] = useState<ActionResult | null>(null)
    const [message, setMessage] = useState<string>("HOME comienza. Selecciona una pieza.")

    const engine = engineRef.current!

    /* ── Helpers de derivación ─────────────────────────────────────── */

    const selectedPiece = useMemo(
        () => (selectedPieceId ? gameState.pieces.find((p) => p.id === selectedPieceId) ?? null : null),
        [gameState.pieces, selectedPieceId],
    )

    const legalMoves = useMemo(() => {
        if (!selectedPieceId) return []
        return engine.getLegalMoves(selectedPieceId)
    }, [selectedPieceId, gameState]) // eslint-disable-line react-hooks/exhaustive-deps

    const passTargets = useMemo(() => {
        if (!selectedPiece || !selectedPiece.hasBall) return []
        return gameState.pieces.filter(
            (p) =>
                p.side === selectedPiece.side &&
                p.id !== selectedPiece.id &&
                p.suspendedTurns <= 0,
        )
    }, [selectedPiece, gameState.pieces])

    const stealTargets = useMemo(() => {
        if (!selectedPiece) return []
        return gameState.pieces.filter((p) => {
            if (p.side === selectedPiece.side) return false
            if (!p.hasBall) return false
            if (p.suspendedTurns > 0) return false
            const dr = Math.abs(selectedPiece.pos.row - p.pos.row)
            const dc = Math.abs(selectedPiece.pos.col - p.pos.col)
            return dr + dc === 1 // adyacencia cardinal
        })
    }, [selectedPiece, gameState.pieces])

    const canShoot = useMemo(() => {
        if (!selectedPiece || !selectedPiece.hasBall) return false
        if (selectedPiece.role === PieceRole.GOALKEEPER) return false
        // Validar si está en zona de tiro (columnas 1-3)
        const error = engine.validateShootAction({
            type: "SHOOT",
            pieceId: selectedPiece.id,
            targetCol: 2, // columna central como prueba
        })
        return error === null
    }, [selectedPiece, gameState]) // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Sync state helper ────────────────────────────────────────── */

    const sync = useCallback(() => {
        // Clonar el estado para disparar re-render
        setGameState({ ...engine.getState() })
    }, [engine])

    const turnLabel = useCallback(
        (side: PlayerSide) => (side === PlayerSide.HOME ? "HOME" : "AWAY"),
        [],
    )

    /* ── Acciones ──────────────────────────────────────────────────── */

    const selectPiece = useCallback(
        (pieceId: string) => {
            if (pendingShoot) return // no cambiar durante shoot pendiente

            const piece = gameState.pieces.find((p) => p.id === pieceId)
            if (!piece) return

            // Solo puede seleccionar piezas del turno actual
            if (piece.side !== gameState.turn) {
                setMessage(`Es turno de ${turnLabel(gameState.turn)}. Selecciona una pieza propia.`)
                return
            }

            if (piece.suspendedTurns > 0) {
                setMessage(`${piece.id} está suspendida por ${piece.suspendedTurns} turno(s).`)
                return
            }

            // Toggle
            if (selectedPieceId === pieceId) {
                setSelectedPieceId(null)
                setMessage(`Turno de ${turnLabel(gameState.turn)}. Selecciona una pieza.`)
            } else {
                setSelectedPieceId(pieceId)
                setMessage(`${pieceId} seleccionada.`)
            }
        },
        [gameState, selectedPieceId, pendingShoot, turnLabel],
    )

    const clearSelection = useCallback(() => {
        setSelectedPieceId(null)
    }, [])

    const afterAction = useCallback(
        (result: ActionResult) => {
            setLastResult(result)
            setMessage(result.message)
            setSelectedPieceId(null)
            sync()

            // Verificar si la partida terminó
            const st = engine.getState()
            if (st.result) {
                setMessage(
                    st.result === "DRAW"
                        ? "Empate."
                        : `${st.result === "HOME_WIN" ? "HOME" : "AWAY"} gana.`,
                )
            }
        },
        [engine, sync],
    )

    const moveToCell = useCallback(
        (to: Pos) => {
            if (!selectedPieceId) return
            const result = engine.performAction({
                type: "MOVE",
                pieceId: selectedPieceId,
                to,
            })
            afterAction(result)
        },
        [selectedPieceId, engine, afterAction],
    )

    const pass = useCallback(
        (targetId: string) => {
            if (!selectedPieceId) return
            const result = engine.performAction({
                type: "PASS",
                pieceId: selectedPieceId,
                targetId,
            })
            afterAction(result)
        },
        [selectedPieceId, engine, afterAction],
    )

    const steal = useCallback(
        (targetId: string) => {
            if (!selectedPieceId) return
            const result = engine.performAction({
                type: "STEAL",
                pieceId: selectedPieceId,
                targetId,
            })
            afterAction(result)
        },
        [selectedPieceId, engine, afterAction],
    )

    const shoot = useCallback(
        (targetCol: number) => {
            if (!selectedPieceId) return
            const action: ShootAction = {
                type: "SHOOT",
                pieceId: selectedPieceId,
                targetCol,
            }
            const error = engine.validateShootAction(action)
            if (error) {
                setMessage(error)
                return
            }
            // Pasar a fase 2: esperar respuesta del portero (jugador rival)
            setPendingShoot({ action, awaitingGoalkeeper: true })
            setSelectedPieceId(null)
            setMessage(
                `${turnLabel(gameState.turn === PlayerSide.HOME ? PlayerSide.AWAY : PlayerSide.HOME)}: elige columna del portero para atajar.`,
            )
        },
        [selectedPieceId, engine, gameState.turn, turnLabel],
    )

    const confirmShoot = useCallback(
        (goalkeeperCol: number) => {
            if (!pendingShoot) return
            const result = engine.performShoot(pendingShoot.action, goalkeeperCol)
            setPendingShoot(null)
            afterAction(result)
        },
        [pendingShoot, engine, afterAction],
    )

    const cancelShoot = useCallback(() => {
        setPendingShoot(null)
        setMessage(`Disparo cancelado. Turno de ${turnLabel(gameState.turn)}.`)
    }, [gameState.turn, turnLabel])

    const restart = useCallback(() => {
        engine.init()
        sync()
        setSelectedPieceId(null)
        setPendingShoot(null)
        setLastResult(null)
        setMessage("HOME comienza. Selecciona una pieza.")
    }, [engine, sync])

    return {
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
    }
}
