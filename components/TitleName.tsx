interface TitleNameProps {
    title: string;
}

export default function TitleName({ title }: TitleNameProps) {
    return (
        <h1 className="text-8xl md:text-9xl font-black uppercase tracking-tight leading-none">
            {title}
        </h1>
    );
}