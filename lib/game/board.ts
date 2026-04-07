/* ═══════════════════════════════════════════════════════════════════════════
 * BOARD — Creación y manipulación del grid
 * ═══════════════════════════════════════════════════════════════════════════ */

import type { Cell, Grid, Pos } from "./types"
import {
    BOARD_ROWS,
    BOARD_COLS,
    GOAL_COL_START,
    GOAL_COLS,
    GOAL_ROW_HOME,
    GOAL_ROW_AWAY,
    MAX_CELL_HEIGHT,
} from "./constants"

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** ¿La fila es portería? */
export function isGoalRow(row: number): boolean {
    return row === GOAL_ROW_HOME || row === GOAL_ROW_AWAY
}

/** ¿La posición es una celda válida dentro del tablero? */
export function isInsideBoard(pos: Pos): boolean {
    const { row, col } = pos
    if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return false
    // En filas de portería solo existen columnas centrales
    if (isGoalRow(row)) {
        return col >= GOAL_COL_START && col < GOAL_COL_START + GOAL_COLS
    }
    return true
}

/** ¿La posición es una celda de portería? */
export function isGoalCell(pos: Pos): boolean {
    return isGoalRow(pos.row) && isInsideBoard(pos)
}

/** ¿La celda se puede pisar? (existe y altura > 0) */
export function isWalkable(grid: Grid, pos: Pos): boolean {
    if (!isInsideBoard(pos)) return false
    const cell = grid[pos.row][pos.col]
    // Porterías no tienen sistema de alturas: siempre pisables
    if (cell.isGoal) return true
    return cell.height > 0
}

/* ── Crear grid inicial ────────────────────────────────────────────────── */

export function createGrid(): Grid {
    const grid: Grid = []

    for (let r = 0; r < BOARD_ROWS; r++) {
        const row: Cell[] = []
        for (let c = 0; c < BOARD_COLS; c++) {
            const goal = isGoalRow(r) && c >= GOAL_COL_START && c < GOAL_COL_START + GOAL_COLS

            // Celdas fuera de portería en filas de portería: no existen realmente.
            // Las modelamos con height=0 para que sean inválidas.
            const outsideGoal = isGoalRow(r) && !goal

            row.push({
                height: outsideGoal ? 0 : MAX_CELL_HEIGHT,
                isGoal: goal,
            })
        }
        grid.push(row)
    }

    return grid
}

/* ── Degradar altura al pisar ──────────────────────────────────────────── */

/**
 * Reduce la altura de una celda en 1.
 * Las porterías no se degradan.
 * Devuelve true si la celda sigue pisable después de degradar.
 */
export function degradeCell(grid: Grid, pos: Pos): boolean {
    const cell = grid[pos.row][pos.col]
    if (cell.isGoal) return true
    cell.height = Math.max(0, cell.height - 1)
    return cell.height > 0
}

/* ── Regenerar todo el tablero ─────────────────────────────────────────── */

/** Restaura todas las alturas a MAX (se llama tras gol o cada N turnos). */
export function regenerateGrid(grid: Grid): void {
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const cell = grid[r][c]
            // Solo regenerar celdas de campo; las "fuera de portería" se quedan en 0
            if (!isGoalRow(r)) {
                cell.height = MAX_CELL_HEIGHT
            } else if (cell.isGoal) {
                cell.height = MAX_CELL_HEIGHT // porterías ya siempre están bien, pero por consistencia
            }
        }
    }
}
