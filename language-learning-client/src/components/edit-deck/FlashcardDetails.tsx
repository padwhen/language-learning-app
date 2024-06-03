import React from 'react';
import { FaTrash } from "react-icons/fa"
import { MdDragHandle } from "react-icons/md"
import { Input } from "../ui/input"
import { Card } from "@/types";

interface EditCardDetailsProps {
    cards: Card[];
    userLang: string;
    onChange: (updatedCards: Card[]) => void;
}

export const EditCardDetails = ({ cards, userLang, onChange }: EditCardDetailsProps) => {
    const capitalizedUserLang = userLang.charAt(0).toUpperCase() + userLang.slice(1);

    const handleCardChange = (index: number, updatedCard: Card) => {
        const updatedCards = [...cards];
        updatedCards[index] = updatedCard;
        onChange(updatedCards);
    }

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const updatedCard = {
            ...cards[index],
            [name]: value,
            cardScore: 0
        };
        handleCardChange(index, updatedCard);
    }

    const handleDeleteCard = (index: number) => {
        const updatedCards = [...cards];
        updatedCards.splice(index, 1);
        onChange(updatedCards);
    }

    return (
        <div>
            {cards.map((card, index) => (
                <div key={card._id} className="w-full rounded-xl h-34 flex flex-col">
                    <div className="flex justify-between border-b-2">
                        <span className="text-3xl ml-8 mb-2">{index + 1}</span>
                        <span className="flex mr-8 gap-8 mt-2">
                            <MdDragHandle className="w-6 h-6" />
                            <FaTrash className="w-6 h-6 cursor-pointer" onClick={() => handleDeleteCard(index)} />
                        </span>
                    </div>
                    <div>
                        <div className="flex justify-between space-x-8 my-4 mx-4">
                            <span className="flex flex-col w-1/2">
                                <Input value={card.userLangCard} type="text" onChange={(e) => handleInputChange(index, e)} name="userLangCard" className="text-lg" />
                                <span className="flex justify-between mt-2">
                                    <h2 className="text-lg text-gray-500">TERM</h2>
                                    <h2 className="text-lg text-blue-500">{capitalizedUserLang}</h2>
                                </span>
                            </span>
                            <span className="flex flex-col w-1/2">
                                <Input value={card.engCard} type="text" onChange={(e) => handleInputChange(index, e)} name="engCard" className="text-lg" />
                                <span className="flex justify-between mt-2">
                                    <h2 className="text-lg text-gray-500">DEFINITION</h2>
                                    <h2 className="text-lg text-blue-500">English</h2>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
