import { FaTrash } from "react-icons/fa"
import { MdDragHandle } from "react-icons/md"
import { Input } from "../ui/input"
import { Card, ChangeEvent } from "@/types";

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

    const handleInputChange = (index: number, event: ChangeEvent) => {
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
                <div key={card._id} className="w-full rounded-xl md:h-34 h-auto flex flex-col">
                    <div className="flex justify-between border-b-2 p-2 md:p-4">
                        <span className="text-2xl md:text-3xl">{index + 1}</span>
                        <span className="flex gap-4 md:gap-8">
                            <MdDragHandle className="w-5 h-5 md:w-6 md:h-6" />
                            <FaTrash data-testid={`delete-card-${index}`} className="md:w-6 md:h-6 w-5 h-5 cursor-pointer" onClick={() => handleDeleteCard(index)} />
                        </span>
                    </div>
                    <div>
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-8 my-4 mx-2 md:mx-4">
                            <span className="flex flex-col w-full md:w-1/2">
                                <Input data-testid={`term-input-${index}`} value={card.userLangCard} type="text" onChange={(e) => handleInputChange(index, e)} name="userLangCard" className="text-base md:text-lg" />
                                <span className="flex justify-between mt-2">
                                    <h2 className="text-base md:text-lg text-gray-500">TERM</h2>
                                    <h2 className="text-base md:text-lg text-blue-500">{capitalizedUserLang}</h2>
                                </span>
                            </span>
                            <span className="flex flex-col w-full md:w-1/2">
                                <Input data-testid={`definition-input-${index}`} value={card.engCard} type="text" onChange={(e) => handleInputChange(index, e)} name="engCard" className="text-lg" />
                                <span className="flex justify-between mt-2">
                                    <h2 className="text-base md:text-lg text-gray-500">DEFINITION</h2>
                                    <h2 className="text-base md:text-lg text-blue-500">English</h2>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
