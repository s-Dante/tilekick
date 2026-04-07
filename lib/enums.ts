/* ═══════════════════════════════════════════════════════════════════════════
 * ENUMS GLOBALES — TileKick
 * Fuente única de verdad para todos los valores enumerados de la app.
 * En la BD se almacenan como String; la validación se hace contra estos enums
 * antes de persistir.  Si el día de mañana cambian, la BD no se rompe.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Match ──────────────────────────────────────────────────────────────── */

export enum MatchMode {
    SINGLE_PLAYER = "SINGLE_PLAYER",
    MULTIPLAYER   = "MULTIPLAYER",
    LOCAL         = "LOCAL",
    TOURNAMENT    = "TOURNAMENT",
}

export enum MatchStatus {
    WAITING   = "WAITING",
    PLAYING   = "PLAYING",
    PAUSED    = "PAUSED",
    FINISHED  = "FINISHED",
    ABANDONED = "ABANDONED",
}

export enum MatchDifficulty {
    EASY   = "EASY",
    MEDIUM = "MEDIUM",
    HARD   = "HARD",
}

/* ── Leaderboard ────────────────────────────────────────────────────────── */

export enum LeaderboardPeriod {
    WEEKLY   = "WEEKLY",
    MONTHLY  = "MONTHLY",
    ALL_TIME = "ALL_TIME",
}

/* ── Social ─────────────────────────────────────────────────────────────── */

export enum FriendshipStatus {
    PENDING  = "PENDING",
    ACCEPTED = "ACCEPTED",
    BLOCKED  = "BLOCKED",
}

export enum ReportStatus {
    PENDING   = "PENDING",
    REVIEWING = "REVIEWING",
    RESOLVED  = "RESOLVED",
    DISMISSED = "DISMISSED",
}

/* ── Achievements ───────────────────────────────────────────────────────── */

export enum AchievementRarity {
    COMMON    = "COMMON",
    RARE      = "RARE",
    EPIC      = "EPIC",
    LEGENDARY = "LEGENDARY",
}

/* ── Game Engine ────────────────────────────────────────────────────────── */

export enum PlayerSide {
    HOME = "HOME",
    AWAY = "AWAY",
}

export enum PieceRole {
    GOALKEEPER = "GOALKEEPER",
    DEFENDER   = "DEFENDER",
    FORWARD    = "FORWARD",
}

export enum ActionType {
    MOVE  = "MOVE",
    PASS  = "PASS",
    SHOOT = "SHOOT",
    STEAL = "STEAL",
}

export enum GameResult {
    HOME_WIN = "HOME_WIN",
    AWAY_WIN = "AWAY_WIN",
    DRAW     = "DRAW",
}

export enum CardType {
    YELLOW = "YELLOW",
    RED    = "RED",
}

/* ── Helpers de validación ──────────────────────────────────────────────── */

/** Valida que un valor pertenezca a un enum dado. */
export function isValidEnum<T extends Record<string, string>>(
    enumObj: T,
    value: string,
): value is T[keyof T] {
    return Object.values(enumObj).includes(value)
}
