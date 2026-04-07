interface SloganProps {
    slogan: string;
}

export default function Slogan({ slogan }: SloganProps) {
    return (
        <p className="text-xl font-medium text-muted-foreground">{slogan}</p>
    );
}