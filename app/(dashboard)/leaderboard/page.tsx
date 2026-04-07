import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/* Datos de ejemplo — reemplazar con datos reales */
const PLAYERS = [
    { rank: 1, name: "Carlos M.", username: "carlosm", score: 9820, wins: 412, losses: 52 },
    { rank: 2, name: "Dante Omar", username: "dante_tk", score: 4820, wins: 247, losses: 89 },
    { rank: 3, name: "Sofía R.", username: "sofiar", score: 4310, wins: 198, losses: 104 },
    { rank: 4, name: "Miguel A.", username: "miguela", score: 3890, wins: 175, losses: 93 },
    { rank: 5, name: "Laura V.", username: "laurav", score: 3540, wins: 162, losses: 88 },
    { rank: 6, name: "Diego F.", username: "diegof", score: 3120, wins: 144, losses: 95 },
    { rank: 7, name: "Ana P.", username: "anap", score: 2870, wins: 131, losses: 101 },
    { rank: 8, name: "Roberto L.", username: "robertol", score: 2540, wins: 119, losses: 108 },
    { rank: 9, name: "Isabella C.", username: "isabellac", score: 2310, wins: 107, losses: 97 },
    { rank: 10, name: "Fernando G.", username: "fernandg", score: 2050, wins: 94, losses: 112 },
];

/* Colores e iconos para el top 3 */
const TOP_STYLES: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-zinc-400",
    3: "text-amber-600",
};

const CURRENT_USER = "dante_tk";

export default function LeaderboardPage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">

            {/* Título */}
            <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Ranking Mundial</h1>
            </div>

            {/* Tabla */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center">#</TableHead>
                            <TableHead>Jugador</TableHead>
                            <TableHead className="text-right">Puntos</TableHead>
                            <TableHead className="text-right text-green-600 dark:text-green-400">V</TableHead>
                            <TableHead className="text-right text-red-500">D</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {PLAYERS.map((player) => (
                            <TableRow
                                key={player.rank}
                                className={cn(
                                    player.username === CURRENT_USER && "bg-primary/5 font-medium"
                                )}
                            >
                                {/* Posición */}
                                <TableCell className="text-center">
                                    <span className={cn(
                                        "text-sm font-bold",
                                        TOP_STYLES[player.rank] ?? "text-muted-foreground"
                                    )}>
                                        {player.rank}
                                    </span>
                                </TableCell>

                                {/* Jugador */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                            <AvatarImage src="" alt={player.name} />
                                            <AvatarFallback className="rounded-lg text-xs font-semibold">
                                                {player.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">
                                                {player.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                @{player.username}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Stats */}
                                <TableCell className="text-right tabular-nums font-semibold">
                                    {player.score.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-green-600 dark:text-green-400">
                                    {player.wins}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-red-500">
                                    {player.losses}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

        </div>
    );
}
