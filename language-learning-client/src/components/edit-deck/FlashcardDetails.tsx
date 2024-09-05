import { FaTrash } from "react-icons/fa"
import { MdDragHandle } from "react-icons/md"
import { Input } from "../ui/input"
import { Card, ChangeEvent, Deck } from "@/types";
import { useContext, useState, useEffect, useCallback } from "react";
import { DeckContext } from "@/DeckContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface EditCardDetailsProps {
    cards: Card[];
    userLang: string;
    onChange: (updatedCards: Card[]) => void;
    deckName: string;
}

interface DuplicateInfo {
    deckName: string;
    isDuplicateTerm: boolean;
    definition: string;
    cardId: string;
}

export const EditCardDetails = ({ cards, userLang, onChange, deckName }: EditCardDetailsProps) => {
    const { decks } = useContext(DeckContext)
    const capitalizedUserLang = userLang.charAt(0).toUpperCase() + userLang.slice(1);
    const [ignoreDuplicates, setIgnoreDuplicates] = useState(false)
    const [duplicates, setDuplicates] = useState<{[key: string]: DuplicateInfo[]}>({})
    const [localDecks, setLocalDecks] = useState<Deck[]>([])

    console.log(duplicates)

    useEffect(() => {
        // Create a deep copy of the decks
        setLocalDecks(JSON.parse(JSON.stringify(decks)))
    }, [decks])

    const findDuplicates = useCallback((card: Card) => {
        const duplicatesFound: DuplicateInfo[] = []
        for (const deck of localDecks) {
            if (deck.deckTags[0].toLowerCase() !== userLang.toLowerCase()) continue;
            const duplicateCards = deck.cards.filter((c) => 
            (c.userLangCard === card.userLangCard) &&
            (c._id !== card._id)
            )
            duplicateCards.forEach(duplicateCard => {
                duplicatesFound.push({
                    deckName: deck.deckName === deckName ? 'This current deck' : `"${deck.deckName}"`,
                    isDuplicateTerm: duplicateCard.userLangCard === card.userLangCard,
                    definition: duplicateCard.engCard,
                    cardId: duplicateCard._id
                })
            })
        }
        return duplicatesFound
    }, [localDecks, deckName, userLang]);

    useEffect(() => {
        const newDuplicates: {[key: string]: DuplicateInfo[]} = {};
        cards.forEach(card => {
            const duplicatesFound = findDuplicates(card)
            if (duplicatesFound.length > 0) {
                newDuplicates[card._id] = duplicatesFound
            }
        });
        setDuplicates(newDuplicates);
    }, [cards, findDuplicates]);

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
        const updatedCards = cards.filter((_, i) => i !== index);
        const deletedCardId = cards[index]._id
        onChange(updatedCards);
        
        // Remove the card from localDecks
        setLocalDecks(prevDecks => 
            prevDecks.map(deck => ({
                ...deck,
                cards: deck.cards.filter(c => c._id !== deletedCardId)
            }))
        );

        // Update duplicates
        setDuplicates(prev => {
            const updated = {...prev}
            delete updated[deletedCardId]
            return updated
        })
    }

    const handleDuplicateAction = (cardId: string, action: string, duplicateCardIds?: string[]) => {
        if (action === 'delete-this') {
            const index = cards.findIndex(card => card._id === cardId)
            if (index !== -1) handleDeleteCard(index)
        } else if (action === 'delete-other') {
            if (duplicateCardIds && duplicateCardIds.length > 0) {
                // Remove the duplicates from localDecks
                setLocalDecks(prevDecks =>
                    prevDecks.map(deck => ({
                        ...deck,
                        cards: deck.cards.filter(c => !duplicateCardIds.includes(c._id))
                    }))
                )
                // Remove the duplicates from the duplicates state
                setDuplicates(prev => {
                    const updated = { ...prev }
                    delete updated[cardId]
                    return updated
                })
            }
        } else if (action === 'keep-no-show') {
            setIgnoreDuplicates(true)
        } else if (action === 'keep-all') {
            // Remove all duplicates for this card from the duplicates state
            setDuplicates(prev => {
                const updated = {...prev}
                delete updated[cardId]
                return updated
            })
        }
    }

    return (
        <div>
            {cards.map((card, index) => {
                const cardDuplicates = duplicates[card._id]
                const showDuplicateWarning = duplicates[card._id] && !ignoreDuplicates
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
                        {showDuplicateWarning && cardDuplicates && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2" role="alert">
                                <strong className="font-bold">
                                    This term has {cardDuplicates.length} duplicate(s)
                                </strong>
                                <ul className="mt-2 list-disc list-inside">
                                    {cardDuplicates.map((duplicate, i) => (
                                        <li key={i}>
                                            {duplicate.deckName} ({card.userLangCard} - {duplicate.definition})
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2">How would you like to proceed?</p>
                                <Select onValueChange={(value) => handleDuplicateAction(card._id, value, cardDuplicates.map(d => d.cardId))}>
                                    <SelectTrigger className="w-[180px] mt-2">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="keep-all">Keep all</SelectItem>
                                        <SelectItem value="delete-this">Delete this one, keep the other(s)</SelectItem>
                                        <SelectItem value="delete-other">Keep this one, delete the other(s)</SelectItem>
                                        <SelectItem value="keep-no-show">Keep all & don't show this message again</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}