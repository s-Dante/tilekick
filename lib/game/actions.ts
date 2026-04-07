/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIONS — Ejecución de cada acción sobre el GameState
 * Cada función MUTA el estado (para rendimiento); si necesitas inmutabilidad
 * haz structuredClone(state) antes de llamarlas.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { ActionType, PlayerSide, PieceRole, CardType } from "@/lib/enums"
import type {
    GameState,
    Piece,
    ActionResult,
    MoveAction,
    PassAction,
    ShootAction,
    StealAction,
} from "./types"
import { degradeCell } from "./board"
import { getPiece } from "./validation"
import {
    STEAL_BASE_PROB,
    STEAL_DIFF_FACTOR,
    FOUL_PROB,
    YELLOW_CARD_PROB,
    YELLOWS_FOR_RED,
    RED_CARD_SUSPENSION,
} from "./constants"

/* ── Utilidades internas ───────────────────────────────────────────────── */

/** Generador de probabilidad inyectable para testing. */
export type RNG = () => number
let _rng: RNG = Math.random
export function setRNG(fn: RNG) { _rng = fn }
export function resetRNG() { _rng = Math.random }

function roll(): number { return _rng() }

function transferBall(from: Piece, to: Piece) {
    from.hasBall = false
    to.hasBall = true
}

/* ── MOVE ──────────────────────────────────────────────────────────────── */

export function executeMove(state: GameState, action: MoveAction): ActionResult {
    const piece = getPiece(state, action.pieceId)!

    // Degradar celda origen (la que abandona)
    degradeCell(state.grid, piece.pos)

    // Mover pieza
    piece.pos = { ...action.to }

    return {
        success: true,
        action,
        message: `${piece.id} se movió a (${action.to.row},${action.to.col})`,
    }
}

/* ── PASS ──────────────────────────────────────────────────────────────── */

export function executePass(state: GameState, action: PassAction): ActionResult {
    const passer   = getPiece(state, action.pieceId)!
    const receiver = getPiece(state, action.targetId)!

    transferBall(passer, receiver)

    return {
        success: true,
        action,
        message: `${passer.id} pasa el balón a ${receiver.id}`,
    }
}

/* ── SHOOT ─────────────────────────────────────────────────────────────── */

/**
 * Ejecuta el disparo.
 * `goalkeeperCol` es la columna donde el portero elige lanzarse.
 * Si coincide con `targetCol`, lo ataja.
 */
export function executeShoot(
    state: GameState,
    action: ShootAction,
    goalkeeperCol: number,
): ActionResult {
    const shooter = getPiece(state, action.pieceId)!

    const rivalSide = state.turn === PlayerSide.HOME ? PlayerSide.AWAY : PlayerSide.HOME
    const gk = state.pieces.find(
        (p) => p.side === rivalSide && p.role === PieceRole.GOALKEEPER,
    )

    const saved = goalkeeperCol === action.targetCol

    if (saved) {
        // Atajada — el balón pasa al portero
        shooter.hasBall = false
        if (gk) {
            gk.hasBall = true
            // Mover portero a la columna donde se lanzó
            gk.pos.col = goalkeeperCol
        }

        return {
            success: false,
            action,
            message: `${gk?.id ?? "Portero"} atajó el disparo de ${shooter.id}`,
            meta: { goal: false, saveBy: gk?.id },
        }
    }

    // ¡GOL!
    shooter.hasBall = false

    return {
        success: true,
        action,
        message: `¡GOL de ${shooter.id}!`,
        meta: { goal: true, goalScorer: shooter.id },
    }
}

/* ── STEAL ─────────────────────────────────────────────────────────────── */

export function executeSteal(state: GameState, action: StealAction): ActionResult {
    const thief  = getPiece(state, action.pieceId)!
    const target = getPiece(state, action.targetId)!

    // Probabilidad = 50% + (def_ladrón - atk_poseedor) * 10%
    const prob = Math.min(
        0.9,
        Math.max(0.1, STEAL_BASE_PROB + (thief.defense - target.attack) * STEAL_DIFF_FACTOR),
    )

    const stealSuccess = roll() < prob

    if (stealSuccess) {
        transferBall(target, thief)
        return {
            success: true,
            action,
            message: `${thief.id} le robó el balón a ${target.id}`,
        }
    }

    // Falló el robo — comprobar falta
    const foul = roll() < FOUL_PROB

    if (!foul) {
        return {
            success: false,
            action,
            message: `${thief.id} falló el robo contra ${target.id}`,
        }
    }

    // Falta cometida — comprobar tarjeta
    const yellowCard = roll() < YELLOW_CARD_PROB

    if (!yellowCard) {
        return {
            success: false,
            action,
            message: `${thief.id} cometió falta contra ${target.id}`,
            meta: { foul: true },
        }
    }

    // Tarjeta amarilla
    thief.yellowCards += 1

    if (thief.yellowCards >= YELLOWS_FOR_RED) {
        // Roja — suspender pieza
        thief.yellowCards = 0
        thief.suspendedTurns = RED_CARD_SUSPENSION
        // Si el expulsado tenía el balón (no debería pero por seguridad)
        if (thief.hasBall) {
            thief.hasBall = false
            target.hasBall = true
        }

        return {
            success: false,
            action,
            message: `${thief.id} recibió ROJA y está suspendido ${RED_CARD_SUSPENSION} turnos`,
            meta: { foul: true, card: CardType.RED, expelled: true },
        }
    }

    return {
        success: false,
        action,
        message: `${thief.id} recibió amarilla por falta a ${target.id}`,
        meta: { foul: true, card: CardType.YELLOW },
    }
}
