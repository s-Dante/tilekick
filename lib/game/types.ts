/* ═══════════════════════════════════════════════════════════════════════════
 * TIPOS DEL GAME ENGINE — TileKick
 * Interfaces puras, sin lógica.  Importar libremente tanto en server como
 * en client.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    PlayerSide,
    PieceRole,
    ActionType,
    CardType,
    GameResult,
} from "@/lib/enums"

/* ── Coordenadas ───────────────────────────────────────────────────────── */

export interface Pos {
    row: number
    col: number
}

/* ── Celda del tablero ─────────────────────────────────────────────────── */

export interface Cell {
    /** Nivel de altura restante (3 → 0).  0 = hueco, no pisable. */
    height: number
    /** true si la celda es parte de una portería */
    isGoal: boolean
}

/* ── Pieza ──────────────────────────────────────────────────────────────── */

export interface Piece {
    id:     string       // e.g. "home_gk", "home_d1", "away_f2"
    side:   PlayerSide
    role:   PieceRole
    pos:    Pos
    attack: number
    defense: number
    /** Tarjetas amarillas acumuladas */
    yellowCards: number
    /** Turnos restantes de suspensión por roja (0 = activa) */
    suspendedTurns: number
    /** true si tiene el balón */
    hasBall: boolean
}

/* ── Estado del tablero (grid) ─────────────────────────────────────────── */

/** Grid bidimensional [row][col] → Cell */
export type Grid = Cell[][]

/* ── Acciones ──────────────────────────────────────────────────────────── */

export interface MoveAction {
    type:    "MOVE"
    pieceId: string
    to:      Pos
}

export interface PassAction {
    type:       "PASS"
    pieceId:    string     // quien pasa
    targetId:   string     // quien recibe
}

export interface ShootAction {
    type:       "SHOOT"
    pieceId:    string     // quien dispara
    targetCol:  number     // columna de portería elegida (1, 2 o 3)
}

export interface StealAction {
    type:       "STEAL"
    pieceId:    string     // quien intenta robar
    targetId:   string     // portador del balón rival
}

export type GameAction = MoveAction | PassAction | ShootAction | StealAction

/* ── Resultado de una acción ───────────────────────────────────────────── */

export interface ActionResult {
    success: boolean
    action:  GameAction
    /** Descripción humana corta del resultado */
    message: string
    /** Datos extra (gol, falta, tarjeta, etc.) */
    meta?: {
        goal?:       boolean
        foul?:       boolean
        card?:       CardType
        expelled?:   boolean  // roja → pieza suspendida
        goalScorer?: string
        saveBy?:     string
    }
}

/* ── Marcador ──────────────────────────────────────────────────────────── */

export interface Score {
    home: number
    away: number
}

/* ── Estado completo del juego (serializable a JSON para la BD) ──────── */

export interface GameState {
    /** Grid con alturas */
    grid:     Grid
    /** Todas las piezas de ambos jugadores */
    pieces:   Piece[]
    /** Marcador */
    score:    Score
    /** De quién es el turno */
    turn:     PlayerSide
    /** Número de turno global (empieza en 1) */
    turnNumber: number
    /** Conteo global para regeneración de alturas */
    globalTurnCount: number
    /** Resultado final (null mientras se juega) */
    result:   GameResult | null
    /** Historial de acciones del partido */
    history:  ActionResult[]
}
