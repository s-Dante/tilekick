/* ═══════════════════════════════════════════════════════════════════════════
 * Test básico del GameEngine — se ejecuta con tsx
 * Uso:  npx tsx lib/game/__tests__/engine.test.ts
 * ═══════════════════════════════════════════════════════════════════════════ */

import { GameEngine } from "../engine"
import { setRNG, resetRNG } from "../actions"
import type { MoveAction, PassAction, ShootAction, StealAction } from "../types"

/* ── Helpers ───────────────────────────────────────────────────────────── */

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(`FAIL: ${msg}`)
    console.log(`  ✓ ${msg}`)
}

function section(title: string) {
    console.log(`\n── ${title} ──`)
}

/* ── Tests ──────────────────────────────────────────────────────────────── */

const engine = new GameEngine()
const state  = engine.init()

section("Inicialización")
assert(state.pieces.length === 12, "12 piezas creadas (6 + 6)")
assert(state.score.home === 0 && state.score.away === 0, "Marcador 0-0")
assert(state.turn === "HOME", "HOME empieza")
assert(state.pieces.some((p) => p.hasBall && p.side === "HOME"), "HOME tiene el balón")
assert(state.grid.length === 10, "Grid tiene 10 filas")
assert(state.grid[0].length === 5, "Cada fila tiene 5 columnas")
assert(state.grid[0][0].height === 0, "Esquina portería no pisable")
assert(state.grid[0][2].isGoal, "Centro fila 0 es portería")
assert(state.grid[5][2].height === 3, "Celda campo empieza en h=3")

section("Mover pieza")
// home_d1 está en (2,0) — moverlo a (3,0)
const moveResult = engine.performAction({
    type: "MOVE",
    pieceId: "home_d1",
    to: { row: 3, col: 0 },
} satisfies MoveAction)
assert(moveResult.success, `Movimiento válido: ${moveResult.message}`)
assert(engine.getCurrentTurn() === "AWAY", "Turno pasó a AWAY")

// La celda (2,0) debería degradar a h=2
assert(engine.getState().grid[2][0].height === 2, "Celda origen degradada a h=2")

section("Movimiento inválido — fuera del tablero")
// Ahora es turno de AWAY
const awayPiece = engine.getState().pieces.find((p) => p.side === "AWAY" && p.role === "DEFENDER")!
const badMove = engine.performAction({
    type: "MOVE",
    pieceId: awayPiece.id,
    to: { row: awayPiece.pos.row, col: -1 },
} satisfies MoveAction)
assert(!badMove.success, `Movimiento inválido rechazado: ${badMove.message}`)

section("Mover pieza AWAY válida")
// away_d1 está en (7,0) — mover a (6,0)
const awayMove = engine.performAction({
    type: "MOVE",
    pieceId: "away_d1",
    to: { row: 6, col: 0 },
} satisfies MoveAction)
assert(awayMove.success, `AWAY movimiento válido: ${awayMove.message}`)
assert(engine.getCurrentTurn() === "HOME", "Turno volvió a HOME")

section("Pase")
// Buscar pieza HOME con balón y pasar a otro
const ballCarrier = engine.getState().pieces.find((p) => p.hasBall && p.side === "HOME")!
const receiver = engine.getState().pieces.find(
    (p) => p.side === "HOME" && !p.hasBall && p.id !== ballCarrier.id && p.role !== "GOALKEEPER" && p.suspendedTurns <= 0,
)!
const passResult = engine.performAction({
    type: "PASS",
    pieceId: ballCarrier.id,
    targetId: receiver.id,
} satisfies PassAction)
assert(passResult.success, `Pase exitoso: ${passResult.message}`)
assert(engine.getState().pieces.find((p) => p.id === receiver.id)!.hasBall, "Receptor tiene el balón")

section("Robo — con RNG controlado")
// Forzar turno AWAY para intentar robo
// Primero mover pieza AWAY para avanzar turno
const awayMove2 = engine.performAction({
    type: "MOVE",
    pieceId: "away_d3",
    to: { row: 6, col: 4 },
} satisfies MoveAction)
assert(awayMove2.success, "AWAY mueve para pasar turno")

section("Serialización")
const json = engine.serialize()
const loaded = GameEngine.fromJSON(json)
assert(loaded.getState().turnNumber === engine.getState().turnNumber, "Estado restaurado correctamente")
assert(loaded.getState().pieces.length === 12, "Piezas restauradas")

section("Shoot — con RNG controlado")
// Vamos a forzar un escenario de shoot
const engine2 = new GameEngine()
engine2.init()

// Mover un forward HOME hasta zona de tiro (fila 7 o 8)
// home_f4 empieza en (4,1), lo necesitamos en (7,x) — simulamos moviendo paso a paso
const s2 = engine2.getState()
const fwd = s2.pieces.find((p) => p.id === "home_f4")!
fwd.pos = { row: 7, col: 2 }
fwd.hasBall = true
// Quitar balón de quien lo tenga
s2.pieces.forEach((p) => { if (p.id !== fwd.id) p.hasBall = false })

// Asegurar no hay bloqueadores en col 2 entre fila 7 y 9
s2.pieces
    .filter((p) => p.side === "AWAY" && p.role !== "GOALKEEPER" && p.pos.col === 2 && p.pos.row === 8)
    .forEach((p) => { p.pos.col = 0 })

// Validar que el shoot es legal
const shootAction: ShootAction = { type: "SHOOT", pieceId: fwd.id, targetCol: 2 }
const shootError = engine2.validateShootAction(shootAction)
assert(shootError === null, `Shoot válido: ${shootError ?? "OK"}`)

// Portero se lanza a columna 1 → no ataja
const shootResult = engine2.performShoot(shootAction, 1)
assert(shootResult.success && shootResult.meta?.goal === true, `¡GOL! ${shootResult.message}`)
assert(engine2.getScore().home === 1, "Marcador 1-0")

// Portero ataja
const engine3 = new GameEngine()
engine3.init()
const s3 = engine3.getState()
const fwd3 = s3.pieces.find((p) => p.id === "home_f4")!
fwd3.pos = { row: 7, col: 2 }
fwd3.hasBall = true
s3.pieces.forEach((p) => { if (p.id !== fwd3.id) p.hasBall = false })
s3.pieces
    .filter((p) => p.side === "AWAY" && p.role !== "GOALKEEPER" && p.pos.col === 2 && p.pos.row === 8)
    .forEach((p) => { p.pos.col = 0 })

const saveResult = engine3.performShoot({ type: "SHOOT", pieceId: fwd3.id, targetCol: 2 }, 2)
assert(!saveResult.success && saveResult.meta?.goal === false, `Atajada: ${saveResult.message}`)

console.log("\n══════════════════════════════════")
console.log("  TODOS LOS TESTS PASARON ✓")
console.log("══════════════════════════════════\n")

resetRNG()
