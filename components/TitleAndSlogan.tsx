import { TitleName, Slogan } from "@/components/index";

interface TitleAndSloganProps {
    title: string;
    slogan: string;
}

export default function TitleAndSlogan({ title, slogan, }: TitleAndSloganProps) {
    return (
        <div className={`flex flex-col gap-2`}>
            <TitleName title={title} />
            <Slogan slogan={slogan} />
        </div>
    );
}