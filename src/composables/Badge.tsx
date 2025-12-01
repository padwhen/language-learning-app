import { Badge } from "@/components/ui/badge";

export const BadgeComponent:React.FC<{word: string}> = ({word}) => {
    return <Badge>{word}</Badge>;
}

