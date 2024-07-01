import { Card } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { usePlaceholder } from "./usePlaceholder";
import { parseImportData } from "@/utils/parseImportData";
import { v4 as uuidv4 } from 'uuid';


export const useImportCards = (setCards: React.Dispatch<React.SetStateAction<Card[]>>) => {
    const [open, setOpen] = useState(false)
    const [importData, setImportData] = useState('')
    const [termSeparator, setTermSeparator] = useState('tab')
    const [cardSeparator, setCardSeparator] = useState('newline')
    const [parsedCards, setParsedCards] = useState<{ term: string, definition: string}[]>([])

    const placeholder = usePlaceholder(termSeparator, cardSeparator)

    const parseCards = useCallback(() => {
        const cards = parseImportData(importData, termSeparator, cardSeparator)
        setParsedCards(cards)
    }, [importData, termSeparator, cardSeparator])

    useEffect(() => {
        parseCards()
    }, [importData, termSeparator, cardSeparator])

    const handleImport = () => {
        const newCards = parsedCards.map((parsedCard) => ({
            _id: uuidv4(),
            engCard: parsedCard.definition,
            userLangCard: parsedCard.term,
            cardScore: 0
        }))
        setCards((prevCards) => [...prevCards, ...newCards])
        setOpen(false)
    }

    return {
        open, setOpen, importData, setImportData, termSeparator, setTermSeparator,
        cardSeparator, setCardSeparator, parsedCards, placeholder, handleImport
    }

}