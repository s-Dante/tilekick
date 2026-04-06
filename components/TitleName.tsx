interface TitleNameProps {
    title: string;
}

export default function TitleName({ title }: TitleNameProps) {
    return (
        <h1 className="text-8xl md:text-9xl font-black uppercase tracking-tighter leading-none bg-gradient-to-br from-foreground via-primary to-primary/60 bg-clip-text text-transparent">
            {title}
        </h1>
    );
}