import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useFetchDeck from '@/state/hooks/useFetchDeck';
import { Card as CardType } from '@/types';
// import { vocabulariesTailor } from '@/ChatCompletion';
import jsonData from './mockData.json';

interface ExtendedCard extends CardType {
  chosen?: boolean;
  aiEngCard?: string;
}

export function CarouselDemo() {
  const id = '663dc3de7d1e5facfbba41c6';
  const { cards } = useFetchDeck(id);
  const [items, setItems] = useState<ExtendedCard[]>([]);

  useEffect(() => {
    if (cards && cards.length > 0) {
      const modifiedCards = cards.filter(card =>
        jsonData.some(modifiedCard => modifiedCard._id === card._id)
      ).map(card => {
        const modifiedCard = jsonData.find(modifiedCard => modifiedCard._id === card._id);
        return {
          ...card,
          aiEngCard: modifiedCard ? modifiedCard.engCard : card.engCard,
          chosen: false,
        };
      });

      setItems(modifiedCards);
    }
  }, [cards]);

  const handleButtonClick = (index: number) => {
    setItems(items.map((item, idx) =>
      idx === index ? { ...item, chosen: true } : { ...item, chosen: false }
    ));
  };

  const allChosen = items.every(item => item.chosen);

  return (
    <div>
      {!allChosen ? (
        <Carousel className="w-full max-w-xs ml-32">
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={item._id}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{item.userLangCard}</span>
                      <div className="mt-4">
                        <p>Original: {item.userLangCard} -&gt; {item.engCard}</p>
                        <p>AI suggestion: {item.userLangCard} -&gt; {item.aiEngCard}</p>
                      </div>
                      <div className="flex space-x-4 mt-4">
                        {!item.chosen && (
                          <>
                            <button
                              className="bg-green-500 text-white px-4 py-2 rounded"
                              onClick={() => handleButtonClick(index)} // Pass index to handleButtonClick
                            >
                              Yes
                            </button>
                            <button
                              className="bg-red-500 text-white px-4 py-2 rounded"
                              onClick={() => handleButtonClick(index)} // Pass index to handleButtonClick
                            >
                              No
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
