import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer"
import { enableTabToIndent } from 'indent-textarea';
import { Input } from "../ui/input";
import { parseImportData } from "@/utils/parseImportData";
import { usePlaceholder } from "@/state/hooks/usePlaceholder";
import { Card } from "@/types";
import { v4 as uuidv4 } from 'uuid';


interface ImportCard {
    term: string;
    definition: string
}

export const ImportCards = ({ setCards } : {setCards: React.Dispatch<React.SetStateAction<Card[]>> }) => {
    const [open, setOpen] = useState(false)
    const [importData, setImportData] = useState('')
    const [termSeparator, setTermSeparator] = useState('tab')
    const [cardSeparator, setCardSeparator] = useState('newline')
    const [parsedCards, setParsedCards] = useState<ImportCard[]>([])

    const placeholder = usePlaceholder(termSeparator, cardSeparator)

    const parseCards = useCallback(() => {
        const cards = parseImportData(importData, termSeparator, cardSeparator)
        setParsedCards(cards)
    }, [importData, termSeparator, cardSeparator])

    useEffect(() => {
        parseCards()
    }, [importData, termSeparator, cardSeparator])

    const textarea = document.querySelector('textarea');
    if (textarea) enableTabToIndent(textarea);

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

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger>
                <Button variant="outline" className="text-lg text-gray-500" size="lg">Import</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="flex flex-col h-full bg-white">
                    <div className="flex-1 py-6 px-4 overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Copy and paste your data here (from Word, Excel, Google Docs, etc..)</h2>
                            <button className="text-gray-400">
                                <span onClick={() => setOpen(false)}>Close Import</span>
                            </button>
                        </div>
                        <div className="mb-6">
                            <textarea
                                className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder={placeholder} 
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Between term and definition
                            </p>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <Input type="radio" className="form-radio text-blue-600"
                                        name="termSeparator" value="tab" checked={termSeparator === 'tab'}
                                        onChange={() => setTermSeparator('tab')} />
                                    <span className="ml-2">Tab</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <Input type="radio" className="form-radio text-blue-600"
                                        name="termSeparator" value='comma' checked={termSeparator === 'comma'}
                                        onChange={() => setTermSeparator('comma')} />
                                    <span className="ml-2">Comma</span>
                                </label>
                                <label className="inline-flex items-center text-gray-400">
                                    <Input type="radio" className="form-radio text-blue-600"
                                        name="termSeparator" value='disabled' checked={termSeparator === 'custom'}
                                        onChange={() => setTermSeparator('custom')} disabled={true} />
                                    <span className="ml-2">Custom</span>
                                </label>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Between Cards</p>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-blue-600"
                                        name="cardSeparator" value="newline" checked={cardSeparator === 'newline'}
                                        onChange={() => setCardSeparator('newline')} />
                                    <span className="ml-2">New line</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <Input type="radio" className="form-radio text-blue-600"
                                        name="cardSeparator" value='semicolon' checked={cardSeparator === 'semicolon'}
                                        onChange={() => setCardSeparator('semicolon')} />
                                    <span className="ml-2">Semicolon</span>
                                </label>
                                <label className="inline-flex items-center text-gray-400">
                                    <Input type="radio" className="form-radio text-blue-600"
                                        name="cardSeparator" value='custom' checked={termSeparator === 'custom'}
                                        onChange={() => setCardSeparator('custom')} disabled={true} />
                                    <span className="ml-2">Custom</span>
                                </label>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {parsedCards.length > 1 ? `Preview. There are currently ${parsedCards.length} cards` : 'Preview'}
                            </h3>
                            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-50 overflow-scroll">
                                <div className="flex mb-2">
                                    <div className="w-1/2 pr-2">
                                        <p className="text-sm text-gray-500">TERM</p>  
                                        <p className="text-base font-medium">{parsedCards[0] ? parsedCards[0].term : 'Word 1'}</p>
                                    </div> 
                                    <div className="w-1/2 pl-2">
                                        <p className="text-sm text-gray-500">DEFINITION</p>  
                                        <p className="text-base font-medium">{parsedCards[0] ? parsedCards[0].definition : 'Word 2'}</p>
                                    </div> 
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <Button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={handleImport}
                        >Import</Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}