interface SloganProps {
    slogan: string;
}

export default function Slogan({ slogan }: SloganProps) {
    return (
        <p className={`text-2xl font-bold`}>{slogan}</p>
    );
}