import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FeaturedCardProps {
    icon1: React.ReactNode;
    icon2: React.ReactNode;
    title: string;
    content: string;
}

export default function FeaturedCard({ icon1, icon2, title, content }: FeaturedCardProps) {
    return (
        <Card className="w-full border border-border/50 hover:border-primary/40 transition-colors duration-200 max-w-[320px]">
            <CardHeader className="pb-2">
                <div className="flex gap-2 text-primary/70 mb-1">
                    {icon1}
                    {icon2}
                </div>
                <CardTitle className="text-base font-semibold mt-2 text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-lg leading-relaxed">{content}</p>
            </CardContent>
        </Card>
    );
}