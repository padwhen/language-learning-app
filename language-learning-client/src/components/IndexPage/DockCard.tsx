import { BadgeComponent } from "@/composables/Badge";
import { Deck } from '@/types';

interface DockCardProps {
    info: Deck;
    isSelected: boolean;
    onClick: () => void;
}

export const DockCard: React.FC<DockCardProps> = ({ info, isSelected, onClick }) => {
    const { deckName, deckPercentage, cards, deckTags } = info;
    const percentage = deckPercentage || 0;

    return (
        <div
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50/30 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/50'
            }`}
            onClick={onClick}
        >
            <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 leading-tight">{deckName}</h3>
                <div className="flex flex-col gap-0.5 text-sm text-gray-600">
                    <span>{percentage} complete</span>
                    <span>{cards?.length || 0} flashcards</span>
                </div>
                {deckTags && deckTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {deckTags.map((word: string, index: React.Key | null | undefined) => (
                            <BadgeComponent key={index} word={word} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

