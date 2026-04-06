import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FeaturedCardProps {
    icon1: React.ReactNode;
    icon2: React.ReactNode;
    title: string;
    content: string;
}

export default function FeaturedCard({ icon1, icon2, title, content }: FeaturedCardProps) {
    return (
        <Card className="group w-full flex flex-col gap-1 bg-card/60 hover:bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <CardHeader className="pb-2">
                <div className="flex flex-row gap-2 text-primary/70 group-hover:text-primary transition-colors duration-300 mb-1">
                    {icon1}
                    {icon2}
                </div>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
            </CardContent>
        </Card>
    );
}