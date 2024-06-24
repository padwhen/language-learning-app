import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SuggestionItem from './CardContentCarousel';
import useModifiedCards from '@/state/hooks/useModifiedCards';
import loadingSvg from '../../assets/3-dots-bounce.svg'
import Countdown from 'react-countdown';
import { useLoading } from '@/state/hooks/useLoading';
import { useHandleButtonClick } from '@/state/hooks/useHandleButtonClick';

interface CarouselDemoProps {
    id: string;
    setChosenOptions: React.Dispatch<React.SetStateAction<any[]>>
}

export function TailoredCarousel({ id, setChosenOptions }: CarouselDemoProps) {
    const { items, setItems, length } = useModifiedCards(id);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
    const [timeoutReached, setTimeoutReached] = useState(false)

    const loading = useLoading()
    const { chosenOptions, handleButtonClick } = useHandleButtonClick()

    useEffect(() => {
        setChosenOptions(chosenOptions)
    }, [chosenOptions, setChosenOptions])


    const handleSuggestionClick = (selectedSuggestion: string, setSelectedSuggestion: any, suggestionType: string, index: number) => {
        const suggestionId = suggestionType === 'original' ? 'original' : `${index}-${suggestionType}`;
        setSelectedSuggestion(suggestionId === selectedSuggestion ? '' : suggestionId); 
    };

    if (loading && items.length == 0 || items.length == 0) {
        return (
            <Card className="w-[450px] text-lg py-32 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                    <img src={loadingSvg} alt="Loading..." />
                    Running through all of your flashcards... <br/>
                    <span>Approximate waiting time: 
                    <Countdown date={Date.now() + (length * 3000)} renderer={({seconds, completed}) => {
                        if (completed) { setTimeoutReached(true) }
                        return <span> {seconds} seconds</span>
                    }
                    }/>
                    </span>
                </CardContent>
            </Card>
        ) 
    }

    if (timeoutReached && items.length === 0) {
        return (
            <Card className="w-[450px] text-lg py-32 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                    <p>There's nothing wrong in your deck</p>
                </CardContent>
            </Card>
        )
    }

    const allChosen = items.every((item) => item.chosen);

    return (
        <div>
        {!allChosen ? (
            <Carousel className="w-[450px] text-lg">
            <CarouselContent>
                {items.map((item, index) => (
                <CarouselItem key={item._id}>
                    <div className="p-1">
                    <Card className='border-none'>
                        <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                        <span className="text-4xl font-semibold">{item.userLangCard}</span>
                        <div className="mt-4 flex flex-col space-y-2">
                            <SuggestionItem
                            type="original"
                            item={item}
                            index={index}
                            selectedSuggestion={selectedSuggestion}
                            handleSuggestionClick={() => handleSuggestionClick(selectedSuggestion, setSelectedSuggestion, 'original', index)}
                            />
                            <SuggestionItem
                            type="ai"
                            item={item}
                            index={index}
                            selectedSuggestion={selectedSuggestion}
                            handleSuggestionClick={() => handleSuggestionClick(selectedSuggestion, setSelectedSuggestion, 'ai', index)}
                            />
                            <SuggestionItem
                            type="dictionary"
                            item={item}
                            index={index}
                            selectedSuggestion={selectedSuggestion}
                            handleSuggestionClick={() => handleSuggestionClick(selectedSuggestion, setSelectedSuggestion, 'dictionary', index)}
                            />
                        </div>
                        <div className="flex space-x-4 mt-4">
                            {!item.chosen && (
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={() => handleButtonClick(
                                items,
                                setItems,
                                index,
                                selectedSuggestion === 'original'
                                    ? item.engCard || ''
                                    : selectedSuggestion === `${index}-ai`
                                    ? item.aiEngCard || ''
                                    : item.dictionarySuggestion || '',
                                selectedSuggestion
                                )}
                            >
                                Choose this suggestion
                            </button>
                            )}
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
        ) : (
            <div>
            <Card className="w-[450px] text-lg py-32 border-none">
                <CardContent className="flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl font-semibold mb-4">Your Edit History</h1>
                {chosenOptions.length > 0 ? (
                    <ul className="list-disc pl-5">
                    {chosenOptions.map(option => (
                        <li key={option._id} className="mb-2">
                        <span className="font-semibold">{option.userLangCard}:</span> {option.chosenOption}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p>No edits made.</p>
                )}
                </CardContent>
            </Card>
            </div>
        )}
        </div>
    );
}
