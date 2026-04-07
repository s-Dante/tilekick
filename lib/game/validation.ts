/* ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION — Reglas de movimiento y validación de acciones
 * Funciones puras: reciben GameState y acción, devuelven boolean o error.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { PlayerSide, PieceRole, ActionType } from "@/lib/enums"
import type { GameState, Piece, Pos, GameAction } from "./types"
import { isInsideBoard, isWalkable, isGoalRow } from "./board"
import {
    BOARD_COLS,
    GOAL_COL_START,
    GOAL_COLS,
    SHOOT_ROWS_HOME,
    SHOOT_ROWS_AWAY,
} from "./constants"

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Obtiene una pieza por ID. */
export function getPiece(state: GameState, id: string): Piece | undefined {
    return state.pieces.find((p) => p.id === id)
}

/** Pieza activa (no suspendida). */
export function isActive(piece: Piece): boolean {
    return piece.suspendedTurns <= 0
}

/** ¿La pieza pertenece al jugador cuyo turno es? */
export function ownsPiece(state: GameState, piece: Piece): boolean {
    return piece.side === state.turn
}

/** Distancia Chebyshev (para adyacencia 8-way). */
export function chebyshev(a: Pos, b: Pos): number {
    return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col))
}

/** Distancia Manhattan (para pases). */
export function manhattan(a: Pos, b: Pos): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

/** ¿Hay alguna pieza (de cualquier jugador) en esa posición? */
export function pieceAt(state: GameState, pos: Pos): Piece | undefined {
    return state.pieces.find(
        (p) => p.pos.row === pos.row && p.pos.col === pos.col && isActive(p),
    )
}

/** Devuelve la pieza que tiene el balón para un bando. Puede ser undefined. */
export function ballCarrier(state: GameState, side: PlayerSide): Piece | undefined {
    return state.pieces.find((p) => p.side === side && p.hasBall)
}

/* ── Validadores por tipo de acción ────────────────────────────────────── */

export type ValidationError = string | null // null = válido

export function validateMove(state: GameState, pieceId: string, to: Pos): ValidationError {
    const piece = getPiece(state, pieceId)
    if (!piece) return "Pieza no encontrada"
    if (!ownsPiece(state, piece)) return "No es tu pieza"
    if (!isActive(piece)) return "Pieza suspendida"
    if (chebyshev(piece.pos, to) !== 1) return "Solo puedes mover 1 casilla"
    if (!isInsideBoard(to)) return "Fuera del tablero"
    if (!isWalkable(state.grid, to)) return "Casilla destruida"
    if (pieceAt(state, to)) return "Casilla ocupada"
    // El portero no puede salir de la fila de portería
    if (piece.role === PieceRole.GOALKEEPER && !isGoalRow(to.row)) {
        return "El portero no puede salir de la portería"
    }
    // Piezas de campo no pueden entrar en su propia portería
    if (piece.role !== PieceRole.GOALKEEPER && isGoalRow(to.row)) {
        const homeGoal = state.turn === PlayerSide.HOME ? 0 : 9
        if (to.row === homeGoal) return "No puedes entrar en tu propia portería"
    }
    return null
}

export function validatePass(state: GameState, pieceId: string, targetId: string): ValidationError {
    const piece = getPiece(state, pieceId)
    if (!piece) return "Pieza no encontrada"
    if (!ownsPiece(state, piece)) return "No es tu pieza"
    if (!isActive(piece)) return "Pieza suspendida"
    if (!piece.hasBall) return "Esta pieza no tiene el balón"

    const target = getPiece(state, targetId)
    if (!target) return "Pieza objetivo no encontrada"
    if (target.side !== piece.side) return "No puedes pasar al rival"
    if (!isActive(target)) return "Pieza objetivo suspendida"
    if (target.id === piece.id) return "No puedes pasarte a ti mismo"

    return null
}

export function validateShoot(state: GameState, pieceId: string, targetCol: number): ValidationError {
    const piece = getPiece(state, pieceId)
    if (!piece) return "Pieza no encontrada"
    if (!ownsPiece(state, piece)) return "No es tu pieza"
    if (!isActive(piece)) return "Pieza suspendida"
    if (!piece.hasBall) return "No tienes el balón"

    // Columna de portería válida
    if (targetCol < GOAL_COL_START || targetCol >= GOAL_COL_START + GOAL_COLS) {
        return "Columna de portería inválida"
    }

    // Zona de tiro
    const shootRows: readonly number[] = state.turn === PlayerSide.HOME ? SHOOT_ROWS_HOME : SHOOT_ROWS_AWAY
    if (!shootRows.includes(piece.pos.row)) {
        return "No estás en zona de tiro"
    }

    // No debe haber pieza rival (que no sea portero) entre el tirador y la portería
    const rivalSide = state.turn === PlayerSide.HOME ? PlayerSide.AWAY : PlayerSide.HOME
    const goalRow = state.turn === PlayerSide.HOME ? 9 : 0
    const direction = goalRow > piece.pos.row ? 1 : -1

    for (let r = piece.pos.row + direction; r !== goalRow; r += direction) {
        const blocking = state.pieces.find(
            (p) =>
                p.side === rivalSide &&
                p.role !== PieceRole.GOALKEEPER &&
                isActive(p) &&
                p.pos.row === r &&
                p.pos.col === piece.pos.col,
        )
        if (blocking) return "Hay un rival bloqueando tu disparo"
    }

    return null
}

export function validateSteal(state: GameState, pieceId: string, targetId: string): ValidationError {
    const piece = getPiece(state, pieceId)
    if (!piece) return "Pieza no encontrada"
    if (!ownsPiece(state, piece)) return "No es tu pieza"
    if (!isActive(piece)) return "Pieza suspendida"

    const target = getPiece(state, targetId)
    if (!target) return "Pieza objetivo no encontrada"
    if (target.side === piece.side) return "No puedes robar a tu propio equipo"
    if (!target.hasBall) return "El rival no tiene el balón"
    if (!isActive(target)) return "Pieza objetivo no activa"

    // Adyacencia cardinal (arriba/abajo/izq/der — NO diagonal)
    const dr = Math.abs(piece.pos.row - target.pos.row)
    const dc = Math.abs(piece.pos.col - target.pos.col)
    if (dr + dc !== 1) return "Debes estar adyacente al portador del balón (cardinal)"

    return null
}

/* ── Validador genérico ────────────────────────────────────────────────── */

export function validateAction(state: GameState, action: GameAction): ValidationError {
    switch (action.type) {
        case "MOVE":
            return validateMove(state, action.pieceId, action.to)
        case "PASS":
            return validatePass(state, action.pieceId, action.targetId)
        case "SHOOT":
            return validateShoot(state, action.pieceId, action.targetCol)
        case "STEAL":
            return validateSteal(state, action.pieceId, action.targetId)
        default:
            return "Acción desconocida"
    }
}
