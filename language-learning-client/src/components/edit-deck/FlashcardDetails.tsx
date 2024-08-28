import { FaTrash } from "react-icons/fa"
import { MdDragHandle } from "react-icons/md"
import { Input } from "../ui/input"
import { Card, ChangeEvent } from "@/types";
import { useContext, useState } from "react";
import { DeckContext } from "@/DeckContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface EditCardDetailsProps {
    cards: Card[];
    userLang: string;
    onChange: (updatedCards: Card[]) => void;
    deckName: string;
}

export const EditCardDetails = ({ cards, userLang, onChange, deckName }: EditCardDetailsProps) => {
    const { decks } = useContext(DeckContext)
    const capitalizedUserLang = userLang.charAt(0).toUpperCase() + userLang.slice(1);
    const [ignoreDuplicates, setIgnoreDuplicates] = useState(false)
    const [keepThisDuplicate, setKeepThisDuplicate] = useState<{[key: string]: boolean}>({})

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
        const deletedCardId = updatedCards[index]._id
        updatedCards.splice(index, 1);
        onChange(updatedCards);
        setKeepThisDuplicate(prev => {
            const updated = {...prev}
            delete updated[deletedCardId]
            return updated
        })
    }

    const findDuplicates = (card: Card) => {
        for (const deck of decks) {
            if (deck.deckTags[0].toLowerCase() !== userLang.toLowerCase()) continue;
            const duplicateCard = deck.cards.find((c) => 
            (c.userLangCard === card.userLangCard || c.engCard === card.engCard) && 
            (c._id !== card._id)
            )
            if (duplicateCard) {
                return {
                    deckName: deck.deckName == deckName ? 'this deck' : `"${deck.deckName}"`,
                    isDuplicate: true,
                    isDuplicateTerm: duplicateCard.userLangCard === card.userLangCard
                }
            }
        }
        return { isDuplicate: false, deckName: '', isDuplicateTerm: false }
    }

    const handleDuplicateAction = (cardId: string, action: string) => {
        if (action === 'delete') {
            const index = cards.findIndex(card => card._id === cardId)
            if (index !== -1) handleDeleteCard(index)
        } else if (action === 'keep-no-show') {
            setIgnoreDuplicates(true)
        } else if (action === 'keep') {
            setKeepThisDuplicate(prev => ({...prev, [cardId]: true}))
        }
    }

    return (
        <div>
            {cards.map((card, index) => {
                const { isDuplicate, deckName, isDuplicateTerm } = findDuplicates(card)
                const showDuplicateWarning = isDuplicate && !ignoreDuplicates && !keepThisDuplicate[card._id]
                return (
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
                        {showDuplicateWarning && isDuplicateTerm && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2" role="alert">
                                <strong className="font-bold">
                                    This term appeared on {deckName}. Do you still want to add?
                                </strong>
                                <Select onValueChange={(value) => handleDuplicateAction(card._id, value)}>
                                    <SelectTrigger className="w-[180px] mt-2">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="keep">Keep</SelectItem>
                                        <SelectItem value="delete">Delete</SelectItem>
                                        <SelectItem value="keep-no-show">Keep & don't show this message again</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
            )})}
        </div>
    )
}
