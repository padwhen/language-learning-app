import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BadgeComponent } from "../composables/Badge";
import { DockCardData } from '@/types';

interface DockCardProps {
    info: DockCardData;
    onSelect: (deckName: string) => void;
}

export const DockCard: React.FC<DockCardProps> = ({info, onSelect}) => {
    const {deckName, deckPercentage, deckQuantity, deckTags} = info
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onSelect(deckName)
        setIsClicked(!isClicked);
    };

    return (
        <Card
        className={`w-[440px] h-[100px] ${isClicked ? 'ring-2 ring-blue-500 transition-all duration-300' : ''}`}
        onClick={handleClick}
        >
        <div className="p-5">
            <div className="flex flex-row justify-between items-center">
            <CardTitle className='text-xl'>{deckName}</CardTitle>
                <CardDescription className="mt-1">{deckPercentage}% complete</CardDescription>
                <CardDescription className="mt-1">{deckQuantity} flashcards</CardDescription>
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
    }
