import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BadgeComponent } from "../../composables/Badge";
import { DockCardData } from '@/types';

interface DockCardProps {
    info: DockCardData;
    onSelect: (deckName: { _id: string; deckName: string }) => void;
}

export const DockCard: React.FC<DockCardProps> = ({info, onSelect}) => {
    const {deckName, deckTags, _id} = info
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onSelect({_id, deckName})
        setIsClicked(!isClicked);
    };

    return (
        <Card
        data-testid="deck-card"
        className={`w-full max-w-2xl min-w-72 h-auto min-h-24 ${isClicked ? 'ring-2 ring-blue-500 transition-all duration-300' : ''}`}
        onClick={handleClick}
        >
        <div className="p-4 sm:p-5">
            <div className="flex flex-row justify-between items-center">
            <CardTitle className='text-lg sm:text-xl'>{deckName}</CardTitle>
                <CardDescription className="mt-1 text-sm sm:text-base">{`${(info?.cards?.filter((card: any) => card.cardScore === 5).length / (info?.cards?.length || 1) * 100).toFixed(0)} % complete`}</CardDescription>
                <CardDescription className="mt-1 text-sm sm:text-base">{info?.cards.length} flashcards</CardDescription>
            </div>
            <CardContent>
            {info.cards.length > 0 && (
                <div className="flex space-x-2 w-full mt-3 items-center justify-center">
                    {deckTags.map((word: string, index: React.Key | null | undefined) => (
                        <BadgeComponent key={index} word={word} />
                    ))}
                </div>
            )}
            </CardContent>
        </div>
        </Card>
    );
    }
