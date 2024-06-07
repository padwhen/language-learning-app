import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SuggestionItem from './CardContentCarousel';
import useModifiedCards from '@/state/hooks/useModifiedCards';

const handleButtonClick = (items: any, setItems: any, setChosenOptions: any, index: number, chosenOption: string) => {
  setItems(items.map((item: any, idx: number) =>
    idx === index ? { ...item, chosen: true } : item
  ));

  setChosenOptions((prevOptions: any) => [
    ...prevOptions.filter((option: any) => option._id !== items[index]._id), // Remove previous choice if exists
    {
      _id: items[index]._id,
      userLangCard: items[index].userLangCard,
      chosenOption,
    },
  ]);
};

const handleSuggestionClick = (selectedSuggestion: string, setSelectedSuggestion: any, suggestionType: string, index: number) => {
  const suggestionId = suggestionType === 'original' ? 'original' : `${index}-${suggestionType}`;
  setSelectedSuggestion(suggestionId === selectedSuggestion ? '' : suggestionId); // Toggle off if selected again
};

export function CarouselDemo() {
    const id = '663dc3de7d1e5facfbba41c6';
    const { items, setItems } = useModifiedCards(id);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string>(''); // Default to empty string
    const [chosenOptions, setChosenOptions] = useState<any[]>([]); // New state to store chosen options
    const allChosen = items.every(item => item.chosen);

    console.log(chosenOptions)

    return (
        <div>
        {!allChosen ? (
            <Carousel className="w-[450px] ml-32 text-lg">
            <CarouselContent>
                {items.map((item, index) => (
                <CarouselItem key={item._id}>
                    <div className="p-1">
                    <Card>
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
                            <>
                                <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={() => handleButtonClick(
                                    items,
                                    setItems,
                                    setChosenOptions,
                                    index,
                                    selectedSuggestion === 'original'
                                    ? item.engCard || '' 
                                    : selectedSuggestion === `${index}-ai`
                                    ? item.aiEngCard || ''
                                    : item.dictionarySuggestion || ''
                                )}
                                >
                                Choose this suggestion
                                </button>
                            </>
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
            <div>All options are chosen</div>
        )}
        </div>
    );
}
