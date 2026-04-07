/* API route para verificar que el engine compila y funciona.
 * GET /api/test-engine
 * Eliminar después de verificar.
 */

import { NextResponse } from "next/server"
import { GameEngine } from "@/lib/game/engine"
import { setRNG, resetRNG } from "@/lib/game/actions"
import { PlayerSide } from "@/lib/enums"
import type { MoveAction, PassAction, ShootAction } from "@/lib/game/types"

interface TestResult {
    name: string
    pass: boolean
    detail: string
}

export async function GET() {
    const results: TestResult[] = []

    function test(name: string, fn: () => void) {
        try {
            fn()
            results.push({ name, pass: true, detail: "OK" })
        } catch (e: unknown) {
            results.push({ name, pass: false, detail: (e as Error).message })
        }
    }

    function assert(cond: boolean, msg: string) {
        if (!cond) throw new Error(msg)
    }

    // ─── Init ───
    const engine = new GameEngine()
    const state = engine.init()

    test("12 piezas creadas", () => assert(state.pieces.length === 12, `Got ${state.pieces.length}`))
    test("Marcador 0-0", () => assert(state.score.home === 0 && state.score.away === 0, "bad score"))
    test("HOME empieza", () => assert(state.turn === "HOME", `turn = ${state.turn}`))
    test("HOME tiene balón", () => assert(state.pieces.some((p) => p.hasBall && p.side === "HOME"), "no ball"))
    test("Grid 10×5", () => assert(state.grid.length === 10 && state.grid[0].length === 5, "bad grid"))
    test("Esquina portería h=0", () => assert(state.grid[0][0].height === 0, `h=${state.grid[0][0].height}`))
    test("Centro portería isGoal", () => assert(state.grid[0][2].isGoal, "not goal"))
    test("Campo h=3", () => assert(state.grid[5][2].height === 3, `h=${state.grid[5][2].height}`))

    // ─── Move ───
    const moveR = engine.performAction({ type: "MOVE", pieceId: "home_d1", to: { row: 3, col: 0 } } satisfies MoveAction)
    test("Move válido", () => assert(moveR.success, moveR.message))
    test("Turno pasa a AWAY", () => assert(engine.getCurrentTurn() === "AWAY", `turn=${engine.getCurrentTurn()}`))
    test("Celda degradada", () => assert(engine.getState().grid[2][0].height === 2, `h=${engine.getState().grid[2][0].height}`))

    // ─── Move AWAY ───
    const awayR = engine.performAction({ type: "MOVE", pieceId: "away_d1", to: { row: 6, col: 0 } } satisfies MoveAction)
    test("AWAY move válido", () => assert(awayR.success, awayR.message))

    // ─── Pass ───
    const bc = engine.getState().pieces.find((p) => p.hasBall && p.side === "HOME")!
    const recv = engine.getState().pieces.find(
        (p) => p.side === "HOME" && !p.hasBall && p.id !== bc.id && p.role !== "GOALKEEPER" && p.suspendedTurns <= 0,
    )!
    const passR = engine.performAction({ type: "PASS", pieceId: bc.id, targetId: recv.id } satisfies PassAction)
    test("Pase exitoso", () => assert(passR.success, passR.message))
    test("Receptor tiene balón", () => assert(engine.getState().pieces.find((p) => p.id === recv.id)!.hasBall, "no ball"))

    // ─── Serialization ───
    const json = engine.serialize()
    const loaded = GameEngine.fromJSON(json)
    test("Serialización round-trip", () => {
        assert(loaded.getState().turnNumber === engine.getState().turnNumber, "turnNumber mismatch")
        assert(loaded.getState().pieces.length === 12, "pieces mismatch")
    })

    // ─── Shoot GOL ───
    const e2 = new GameEngine()
    e2.init()
    const s2 = e2.getState()
    const fwd = s2.pieces.find((p) => p.id === "home_f4")!
    fwd.pos = { row: 7, col: 2 }
    fwd.hasBall = true
    s2.pieces.forEach((p) => { if (p.id !== fwd.id) p.hasBall = false })
    s2.pieces
        .filter((p) => p.side === "AWAY" && p.role !== "GOALKEEPER" && p.pos.col === 2 && p.pos.row === 8)
        .forEach((p) => { p.pos.col = 0 })

    test("Shoot válido", () => assert(e2.validateShootAction({ type: "SHOOT", pieceId: fwd.id, targetCol: 2 }) === null, "should be valid"))

    const goalR = e2.performShoot({ type: "SHOOT", pieceId: fwd.id, targetCol: 2 }, 1)
    test("GOL marcado", () => assert(goalR.success && goalR.meta?.goal === true, goalR.message))
    test("Score 1-0", () => assert(e2.getScore().home === 1, `score=${JSON.stringify(e2.getScore())}`))

    // ─── Shoot ATAJADA ───
    const e3 = new GameEngine()
    e3.init()
    const s3 = e3.getState()
    const fwd3 = s3.pieces.find((p) => p.id === "home_f4")!
    fwd3.pos = { row: 7, col: 2 }
    fwd3.hasBall = true
    s3.pieces.forEach((p) => { if (p.id !== fwd3.id) p.hasBall = false })
    s3.pieces
        .filter((p) => p.side === "AWAY" && p.role !== "GOALKEEPER" && p.pos.col === 2 && p.pos.row === 8)
        .forEach((p) => { p.pos.col = 0 })

    const saveR = e3.performShoot({ type: "SHOOT", pieceId: fwd3.id, targetCol: 2 }, 2)
    test("Atajada", () => assert(!saveR.success && saveR.meta?.goal === false, saveR.message))

    // ─── Steal (RNG fijo) ───
    const e4 = new GameEngine()
    e4.init()
    const s4 = e4.getState()
    // Poner una pieza HOME adyacente al portador AWAY
    const awayBall = s4.pieces.find((p) => p.side === "AWAY" && p.role === "FORWARD")!
    awayBall.hasBall = true
    awayBall.pos = { row: 5, col: 2 }
    s4.pieces.forEach((p) => { if (p.id !== awayBall.id) p.hasBall = false })
    const homeDef = s4.pieces.find((p) => p.side === "HOME" && p.role === "DEFENDER")!
    homeDef.pos = { row: 5, col: 1 }
    s4.turn = PlayerSide.HOME

    // RNG = siempre 0 → robo exitoso (0 < prob)
    setRNG(() => 0)
    const stealR = e4.performAction({ type: "STEAL", pieceId: homeDef.id, targetId: awayBall.id })
    test("Steal exitoso (RNG=0)", () => assert(stealR.success, stealR.message))
    resetRNG()

    // ─── Resultados ───
    const passed = results.filter((r) => r.pass).length
    const failed = results.filter((r) => !r.pass).length

    return NextResponse.json({
        summary: `${passed} passed, ${failed} failed out of ${results.length}`,
        allPassed: failed === 0,
        results,
    }, { status: failed > 0 ? 500 : 200 })
}
