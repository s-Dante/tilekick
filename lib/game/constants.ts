/* ═══════════════════════════════════════════════════════════════════════════
 * CONSTANTES DEL JUEGO — TileKick
 * Todo lo numérico / configurable vive aquí para ajustarlo fácilmente.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { PieceRole } from "@/lib/enums"

/* ── Dimensiones del tablero ───────────────────────────────────────────── */

/** Filas totales: 8 de campo + 2 de portería */
export const BOARD_ROWS    = 10
/** Columnas del campo */
export const BOARD_COLS    = 5
/** Columnas por fila de portería (centradas) */
export const GOAL_COLS     = 3
/** Primera columna de portería (0-indexed: columnas 1, 2, 3) */
export const GOAL_COL_START = 1
/** Fila de portería HOME (arriba) */
export const GOAL_ROW_HOME = 0
/** Fila de portería AWAY (abajo) */
export const GOAL_ROW_AWAY = 9

/* ── Alturas ───────────────────────────────────────────────────────────── */

/** Altura máxima de cada celda */
export const MAX_CELL_HEIGHT  = 3
/** Cada cuántos turnos globales se regenera el tablero */
export const REGEN_INTERVAL   = 5

/* ── Reglas de partido ─────────────────────────────────────────────────── */

/** Goles para ganar */
export const GOALS_TO_WIN  = 3
/** Turnos máximos antes de finalizar */
export const MAX_TURNS     = 20
/** Piezas de campo por jugador */
export const FIELD_PIECES  = 5
/** Piezas totales por jugador (campo + portero) */
export const TOTAL_PIECES  = 6

/* ── Stats base de piezas ──────────────────────────────────────────────── */

export interface PieceStats {
    attack:  number
    defense: number
}

export const BASE_STATS: Record<PieceRole, PieceStats> = {
    [PieceRole.GOALKEEPER]: { attack: 1, defense: 5 },
    [PieceRole.DEFENDER]:   { attack: 2, defense: 4 },
    [PieceRole.FORWARD]:    { attack: 4, defense: 2 },
}

/* ── Probabilidades ────────────────────────────────────────────────────── */

/** Probabilidad base de robo (50%) */
export const STEAL_BASE_PROB       = 0.5
/** Cada punto de diferencia def-atk suma/resta 10% */
export const STEAL_DIFF_FACTOR     = 0.1
/** Probabilidad de falta al fallar robo */
export const FOUL_PROB             = 0.2
/** Probabilidad de amarilla al cometer falta */
export const YELLOW_CARD_PROB      = 0.1
/** Amarillas para roja */
export const YELLOWS_FOR_RED       = 2
/** Turnos suspendido por roja */
export const RED_CARD_SUSPENSION   = 3

/* ── Zonas de disparo ──────────────────────────────────────────────────── */

/**
 * Filas desde las que HOME puede disparar (las 2 últimas antes de la
 * portería AWAY). El campo va de fila 1 a fila 8.
 * HOME ataca hacia abajo → filas 7, 8 son zona de tiro.
 */
export const SHOOT_ROWS_HOME = [7, 8] as const
/** AWAY ataca hacia arriba → filas 1, 2 son zona de tiro. */
export const SHOOT_ROWS_AWAY = [1, 2] as const

/* ── Formaciones iniciales ─────────────────────────────────────────────── */

/**
 * Posiciones iniciales relativas para HOME (fila crece hacia abajo).
 * HOME ocupa filas 1-4 del campo; AWAY se espejea.
 * [row, col, role]
 */
export const HOME_FORMATION: [number, number, PieceRole][] = [
    [0, 2, PieceRole.GOALKEEPER],  // Portero en portería (fila 0, centro)
    [2, 0, PieceRole.DEFENDER],
    [2, 2, PieceRole.DEFENDER],
    [2, 4, PieceRole.DEFENDER],
    [4, 1, PieceRole.FORWARD],
    [4, 3, PieceRole.FORWARD],
]

/**
 * Espejo para AWAY: fila = (BOARD_ROWS - 1) - filaOriginal
 */
export const AWAY_FORMATION: [number, number, PieceRole][] =
    HOME_FORMATION.map(([r, c, role]) => [BOARD_ROWS - 1 - r, c, role])
