import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Card,
    CardContent,
    CardHeader,
    Separator
} from "@/components/index";

const USER = {
    name: "Dante Omar",
    username: "dante_tk",
    email: "dante@tilekick.com",
    avatar: "/avatars/user.jpg",
    rank: "Diamante",
    joined: "Enero 2024",
};

const STATS = [
    { label: "Victorias", value: "247" },
    { label: "Derrotas", value: "89" },
    { label: "Tasa de victoria", value: "73.5%" },
    { label: "Puntuación", value: "4,820" },
];

export default function ProfilePage() {
    return (
        /* Centrado vertical y horizontal — efecto modal dentro de la vista */
        <div className="flex items-start justify-center justify-self-center p-8 pt-12">
            <Card className="w-full max-w-lg">

                {/* Cabecera: avatar + info básica + rango */}
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 text-2xl">
                        <Avatar className="h-16 w-16 rounded-lg shrink-0">
                            <AvatarImage src={USER.avatar} alt={USER.name} />
                            <AvatarFallback className="rounded-lg text-xl font-bold">
                                {USER.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 overflow-hidden">
                            <h2 className="text-2xl font-bold truncate">{USER.name}</h2>
                            <p className="text-xl text-muted-foreground">@{USER.username}</p>
                            <p className="text-xl text-muted-foreground truncate">{USER.email}</p>
                        </div>

                        <Badge variant="secondary" className="shrink-0">{USER.rank}</Badge>
                    </div>
                </CardHeader>

                <Separator />

                {/* Estadísticas */}
                <CardContent className="pt-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {STATS.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-lg bg-muted/40 p-3 text-center"
                            >
                                <p className="text-lg font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-5">
                        Miembro desde {USER.joined}
                    </p>
                </CardContent>

            </Card>
        </div>
    );
}
