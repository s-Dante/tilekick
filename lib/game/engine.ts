/* ═══════════════════════════════════════════════════════════════════════════
 * GAME ENGINE — TileKick
 *
 * Clase principal que gestiona el ciclo de vida de una partida.
 * Diseñada para ser usada tanto en server (socket.io/api) como en client
 * (modo local).  El estado es serializable a JSON para persistencia.
 *
 * Uso básico:
 *   const engine = new GameEngine()
 *   engine.init()
 *   const result = engine.performAction({ type: ActionType.MOVE, pieceId: "home_d1", to: { row: 3, col: 1 } })
 *   // result contiene success, message, meta (gol, falta, etc.)
 *
 * Para disparo (SHOOT):
 *   const result = engine.performShoot(shootAction, goalkeeperCol)
 *   // El goalkeeperCol viene del jugador defensor (selección de portero)
 * ═══════════════════════════════════════════════════════════════════════════ */

import { PlayerSide, PieceRole, ActionType, GameResult } from "@/lib/enums"
import type { GameState, Piece, GameAction, ActionResult, ShootAction, Score } from "./types"
import {
    BOARD_ROWS,
    GOALS_TO_WIN,
    MAX_TURNS,
    REGEN_INTERVAL,
    BASE_STATS,
    HOME_FORMATION,
    AWAY_FORMATION,
} from "./constants"
import { createGrid, regenerateGrid } from "./board"
import { validateAction, validateShoot, validateMove } from "./validation"
import { executeMove, executePass, executeShoot, executeSteal } from "./actions"

/* ═══════════════════════════════════════════════════════════════════════════ */

export class GameEngine {
    private state!: GameState

    /* ── Inicialización ────────────────────────────────────────────────── */

    /** Crea una partida nueva con el estado inicial. */
    init(): GameState {
        const pieces: Piece[] = []

        // Crear piezas HOME
        HOME_FORMATION.forEach(([row, col, role], i) => {
            const suffix = role === PieceRole.GOALKEEPER ? "gk" : role === PieceRole.DEFENDER ? `d${i}` : `f${i}`
            const stats = BASE_STATS[role]
            pieces.push({
                id: `home_${suffix}`,
                side: PlayerSide.HOME,
                role,
                pos: { row, col },
                attack: stats.attack,
                defense: stats.defense,
                yellowCards: 0,
                suspendedTurns: 0,
                hasBall: false,
            })
        })

        // Crear piezas AWAY
        AWAY_FORMATION.forEach(([row, col, role], i) => {
            const suffix = role === PieceRole.GOALKEEPER ? "gk" : role === PieceRole.DEFENDER ? `d${i}` : `f${i}`
            const stats = BASE_STATS[role]
            pieces.push({
                id: `away_${suffix}`,
                side: PlayerSide.AWAY,
                role,
                pos: { row, col },
                attack: stats.attack,
                defense: stats.defense,
                yellowCards: 0,
                suspendedTurns: 0,
                hasBall: false,
            })
        })

        // HOME empieza con balón en un delantero
        const homeForward = pieces.find(
            (p) => p.side === PlayerSide.HOME && p.role === PieceRole.FORWARD,
        )
        if (homeForward) homeForward.hasBall = true

        this.state = {
            grid: createGrid(),
            pieces,
            score: { home: 0, away: 0 },
            turn: PlayerSide.HOME,
            turnNumber: 1,
            globalTurnCount: 0,
            result: null,
            history: [],
        }

        return this.getState()
    }

    /** Carga un estado existente (para reanudar partida desde BD). */
    load(state: GameState): void {
        this.state = state
    }

    /* ── Getters ───────────────────────────────────────────────────────── */

    getState(): GameState {
        return this.state
    }

    getScore(): Score {
        return this.state.score
    }

    isFinished(): boolean {
        return this.state.result !== null
    }

    getCurrentTurn(): PlayerSide {
        return this.state.turn
    }

    /* ── Acciones normales (MOVE, PASS, STEAL) ─────────────────────────── */

    /**
     * Ejecuta una acción que NO es SHOOT.
     * Para SHOOT, usa `performShoot()` que requiere la respuesta del portero.
     */
    performAction(action: GameAction): ActionResult {
        if (this.isFinished()) {
            return { success: false, action, message: "La partida ya terminó" }
        }

        if (action.type === "SHOOT") {
            return { success: false, action, message: "Usa performShoot() para disparos" }
        }

        // Validar
        const error = validateAction(this.state, action)
        if (error) {
            return { success: false, action, message: error }
        }

        // Ejecutar
        let result: ActionResult

        switch (action.type) {
            case "MOVE":
                result = executeMove(this.state, action)
                break
            case "PASS":
                result = executePass(this.state, action)
                break
            case "STEAL":
                result = executeSteal(this.state, action)
                break
            default:
                return { success: false, action, message: "Acción desconocida" }
        }

        // Registrar y avanzar turno
        this.state.history.push(result)
        this.advanceTurn()

        return result
    }

    /* ── SHOOT (2 fases: disparo + respuesta portero) ──────────────────── */

    /**
     * Valida que el disparo sea legal. El UI debe llamar esto primero
     * y si es válido, pedir al defensor la columna del portero.
     */
    validateShootAction(action: ShootAction): string | null {
        if (this.isFinished()) return "La partida ya terminó"
        return validateShoot(this.state, action.pieceId, action.targetCol)
    }

    /**
     * Ejecuta el disparo después de que el defensor eligió dónde lanzarse.
     */
    performShoot(action: ShootAction, goalkeeperCol: number): ActionResult {
        if (this.isFinished()) {
            return { success: false, action, message: "La partida ya terminó" }
        }

        const error = validateShoot(this.state, action.pieceId, action.targetCol)
        if (error) {
            return { success: false, action, message: error }
        }

        const result = executeShoot(this.state, action, goalkeeperCol)

        // Si fue gol → actualizar marcador, posiblemente terminar partido
        if (result.meta?.goal) {
            if (this.state.turn === PlayerSide.HOME) {
                this.state.score.home += 1
            } else {
                this.state.score.away += 1
            }

            // Comprobar victoria por goles
            if (
                this.state.score.home >= GOALS_TO_WIN ||
                this.state.score.away >= GOALS_TO_WIN
            ) {
                this.state.result =
                    this.state.score.home >= GOALS_TO_WIN
                        ? GameResult.HOME_WIN
                        : GameResult.AWAY_WIN
            } else {
                // Resetear tablero y posiciones tras gol
                this.resetAfterGoal()
            }
        }

        this.state.history.push(result)

        // Si no terminó, avanzar turno
        if (!this.isFinished()) {
            this.advanceTurn()
        }

        return result
    }

    /* ── Turno ─────────────────────────────────────────────────────────── */

    private advanceTurn(): void {
        // Descontar suspensiones de piezas del bando que acaba de jugar
        this.state.pieces
            .filter((p) => p.side === this.state.turn && p.suspendedTurns > 0)
            .forEach((p) => { p.suspendedTurns -= 1 })

        // Cambiar turno
        this.state.turn =
            this.state.turn === PlayerSide.HOME ? PlayerSide.AWAY : PlayerSide.HOME

        // Incrementar turnNumber cuando vuelve a tocar HOME (= 1 ronda completa)
        if (this.state.turn === PlayerSide.HOME) {
            this.state.turnNumber += 1
        }

        // Conteo global para regeneración
        this.state.globalTurnCount += 1
        if (this.state.globalTurnCount % REGEN_INTERVAL === 0) {
            regenerateGrid(this.state.grid)
        }

        // Comprobar victoria por turnos
        if (this.state.turnNumber > MAX_TURNS) {
            this.resolveByScore()
        }
    }

    private resolveByScore(): void {
        const { home, away } = this.state.score
        if (home > away) {
            this.state.result = GameResult.HOME_WIN
        } else if (away > home) {
            this.state.result = GameResult.AWAY_WIN
        } else {
            this.state.result = GameResult.DRAW
        }
    }

    /* ── Post-gol ──────────────────────────────────────────────────────── */

    private resetAfterGoal(): void {
        // Regenerar alturas
        regenerateGrid(this.state.grid)

        // Recolocar piezas en formación inicial
        const homeFormation = HOME_FORMATION
        const awayFormation = AWAY_FORMATION

        const homePieces = this.state.pieces.filter((p) => p.side === PlayerSide.HOME)
        const awayPieces = this.state.pieces.filter((p) => p.side === PlayerSide.AWAY)

        homePieces.forEach((p, i) => {
            if (i < homeFormation.length) {
                p.pos = { row: homeFormation[i][0], col: homeFormation[i][1] }
            }
            p.hasBall = false
        })

        awayPieces.forEach((p, i) => {
            if (i < awayFormation.length) {
                p.pos = { row: awayFormation[i][0], col: awayFormation[i][1] }
            }
            p.hasBall = false
        })

        // El equipo que RECIBIÓ el gol saca (empieza con balón)
        const receivingSide =
            this.state.turn === PlayerSide.HOME ? PlayerSide.AWAY : PlayerSide.HOME
        const kickoffPiece = this.state.pieces.find(
            (p) => p.side === receivingSide && p.role === PieceRole.FORWARD,
        )
        if (kickoffPiece) kickoffPiece.hasBall = true
    }

    /* ── Utilidades públicas ───────────────────────────────────────────── */

    /** Devuelve las casillas legales de movimiento para una pieza. */
    getLegalMoves(pieceId: string): import("./types").Pos[] {
        const piece = this.state.pieces.find((p) => p.id === pieceId)
        if (!piece || piece.side !== this.state.turn || piece.suspendedTurns > 0) return []

        const moves: import("./types").Pos[] = []
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue
                const to = { row: piece.pos.row + dr, col: piece.pos.col + dc }
                if (!validateMove(this.state, pieceId, to)) moves.push(to)
            }
        }
        return moves
    }

    /** Serializa el estado para guardar en BD. */
    serialize(): string {
        return JSON.stringify(this.state)
    }

    /** Carga desde JSON de BD. */
    static fromJSON(json: string): GameEngine {
        const engine = new GameEngine()
        engine.load(JSON.parse(json))
        return engine
    }
}
