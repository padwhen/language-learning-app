import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BadgeComponent } from "../composables/Badge";
import { Deck } from '@/types';

interface DockCardProps {
    info: Deck;
    isSelected: boolean;
    onClick: () => void;
}

export const DockCard: React.FC<DockCardProps> = ({ info, isSelected, onClick }) => {
    const { deckName, deckPercentage, cards, deckTags } = info;

    return (
        <Card
            className={`w-[440px] h-[100px] ${isSelected ? 'ring-2 ring-blue-500 transition-all duration-300' : ''}`}
            onClick={onClick}
        >
            <div className="p-5">
                <div className="flex flex-row justify-between items-center">
                    <CardTitle className='text-xl'>{deckName}</CardTitle>
                    <CardDescription className="mt-1">{deckPercentage} complete</CardDescription>
                    <CardDescription className="mt-1">{cards.length} flashcards</CardDescription>
                </div>
                <CardContent>
                    <div className="flex space-x-2 w-full mt-3 items-center justify-center">
                        {deckTags.map((word: string, index: React.Key | null | undefined) => (
                            <BadgeComponent key={index} word={word} />
                        ))}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

