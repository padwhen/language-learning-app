import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BadgeComponent } from "../composables/Badge";
import { DockCardData } from '@/types';

interface DockCardProps {
    info: DockCardData;
    onSelect: (deckName: string) => void;
}

export const DockCard: React.FC<DockCardProps> = ({info, onSelect}) => {
    const {name, completePercentage, flashcardsCount, badgeWords} = info
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        onSelect(name)
        setIsClicked(!isClicked);
    };

    return (
        <Card
        className={`w-[440px] h-[100px] ${isClicked ? 'ring-2 ring-blue-500 transition-all duration-300' : ''}`}
        onClick={handleClick}
        >
        <div className="p-5">
            <div className="flex flex-row justify-between items-center">
            <CardTitle className='text-xl'>{name}</CardTitle>
                <CardDescription className="mt-1">{completePercentage}% complete</CardDescription>
                <CardDescription className="mt-1">{flashcardsCount} flashcards</CardDescription>
            </div>
            <CardContent>
            <div className="flex space-x-2 w-full mt-3 items-center justify-center">
                {badgeWords.map((word: string, index: React.Key | null | undefined) => (
                    <BadgeComponent key={index} word={word} />
                ))}
            </div>
            </CardContent>
        </div>
        </Card>
    );
    }
