import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IoIosDoneAll } from "react-icons/io";
import { IoMdSwap } from "react-icons/io";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ToolTip } from "@/composables/ToolTip";
import jsonData from './deck-example.json';
import { Card, Deck } from '@/types';
import { DndContext, closestCorners } from '@dnd-kit/core'
import { EditCardDetails } from "./FlashcardDetails";

const data: Deck = jsonData;

export const EditPage = () => {
    const [cards, setCards] = useState<Card[]>(data.cards);
    const userLang = data.deckTags[0];

    const addCard = () => {
        const newCard: Card = {
            _id: uuidv4(),
            engCard: '',
            userLangCard: '',
            cardScore: 0
        };
        setCards([...cards, newCard]);
    };

    const handleCardChange = (updatedCards: Card[]) => {
        setCards(updatedCards);
    }

    const handleDone = () => {
        const updatedDeck: Deck = {
            ...data, 
            cards: cards.map(card => ({
                ...card, cardScore: 0
            }))
        }
        console.log(updatedDeck)
    }

    return (
        <div className="pt-8">
            <div className="container sticky top-0 w-full flex justify-between bg-white z-10 py-4">
                <div className="mr-auto flex gap-16">
                    <Button className="flex gap-2 items-center justify-center text-xl" onClick={handleDone}>
                        <IoIosDoneAll />
                        Done
                    </Button>
                    <span className="flex justify-center items-center text-red-500 font-bold">
                        Note: Modifying the cards will reset their score, meaning that all previous progress will be deleted, and you'll have to start over again.
                    </span>
                </div>
            </div>
            <div className="px-32 mt-8 w-full flex flex-col space-y-2">
                <div>
                    <Label htmlFor="title" className="text-xl">Title</Label>
                    <Input type="text" value={data.deckName} size={80} className="mt-1 text-xl" />
                </div>
                <div className="flex flex-row gap-4">
                    <span className="w-3/4">
                        <Label htmlFor="tags" className="text-xl">Tags</Label>
                        <Input type="text" value={data.deckTags.join(', ')} size={80} className="mt-1 text-xl" />
                    </span>
                    <span className="w-1/4">
                        <Label htmlFor="language" className="text-xl">Language</Label>
                        <Input type="text" value={userLang} size={80} className="mt-1 text-xl" />
                    </span>
                </div>
                <div className="flex justify-between pt-4">
                    <Button variant="outline" className="text-lg text-gray-500" size="lg">Import</Button>
                    <div><ToolTip trigger={<IoMdSwap />} content="Flip terms and definition" /></div>
                </div>
                <DndContext collisionDetection={closestCorners}>
                    <div className="flex flex-col space-y-8 pt-16">
                        <EditCardDetails
                            cards={cards}
                            userLang={userLang}
                            onChange={handleCardChange}
                        />
                        <div
                            className="w-full rounded-xl h-34 flex flex-col cursor-pointer"
                            onClick={addCard}
                        >
                            <span className="flex justify-center items-center">
                                <h1 className="text-3xl border-b-4 pb-1 hover:border-blue-500">+ Add Card</h1>
                            </span>
                        </div>
                    </div>                    
                </DndContext>
                <div className="bg-white z-10 py-4 flex justify-end w-full">
                    <Button className="flex gap-2 items-center justify-center text-xl" onClick={handleDone}>
                        <IoIosDoneAll />
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditPage;
