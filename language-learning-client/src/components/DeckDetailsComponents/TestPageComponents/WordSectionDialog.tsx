import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useFetchDeck from "@/state/hooks/useFetchDeck";
import { ArrowUpDown, SortAsc } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface WordSelectionDialogProps {
    isOpen: boolean;
    onClose: (selectedCards: any[] | null) => void;

}

export const WordSelectionDialog: React.FC<WordSelectionDialogProps> = ({
    isOpen, onClose
}) => {
    const { id } = useParams()
    const { cards } = useFetchDeck(id)

    const [selectedWords, setSelectedWords] = useState<string[]>([])
    const [filter, setFilter] = useState('')
    const [sortBy, setSortBy] = useState<'Alphabetical'|'Score'>('Alphabetical')
    const [remainingWords, setRemainingWords] = useState(10)

    useEffect(() => {
        setRemainingWords(10 - selectedWords.length)
    }, [selectedWords])

    useEffect(() => {
        if (!isOpen) {
            setSelectedWords([])
            setFilter('')
            setSortBy('Alphabetical')
        }
    }, [isOpen])
    
    const handleWordSelection = (word: string) => {
        setSelectedWords(prev => {
            if (prev.includes(word)) {
                return prev.filter(w => w !== word)
            } else if (prev.length < 10) {
                return [...prev, word]
            }
            return prev
        })
    }

    const scrollToWord = (word: string) => {
        const element = document.getElementById(`word-${word}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center'})
        }
    }

    const handleAutoSelect = () => {
        const sortedCards = [...cards].sort((a, b) => b.cardScore - a.cardScore)
        setSelectedWords(sortedCards.slice(0, 10).map(card => card.userLangCard))
    }

    const handleConfirmSelection = () => {
        const selectedCards = cards.filter(card => selectedWords.includes(card.userLangCard))
        onClose(selectedCards)
    }

    const filteredCards = cards
        .filter(card => 
            card.userLangCard.toLowerCase().includes(filter.toLocaleLowerCase()) || 
            card.engCard.toLowerCase().includes(filter.toLocaleLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'Alphabetical') {
                return a.userLangCard.localeCompare(b.userLangCard);
            } else {
                return b.cardScore - a.cardScore;
            }
        })

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select words to test (maximum 10)</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="Search words..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <div className="flex justify-between mb-4">
                    <Button onClick={() => setSortBy('Alphabetical')}
                            variant={sortBy === 'Alphabetical' ? 'default' : 'outline'}        
                    >
                        {sortBy === 'Alphabetical' && <SortAsc className="mr-2 h-4 w-4" />}
                        Sort Alphabetical
                    </Button>
                    <Button onClick={() => setSortBy('Score')}
                            variant={sortBy === 'Score' ? 'default' : 'outline'} 
                    >
                        {sortBy === 'Score' && <ArrowUpDown className="mr-2 h-4 w-4" />}
                        Sort by Progress
                    </Button>
                </div>
                {selectedWords.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-2">Words you added ({ remainingWords }) left</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedWords.map(word => (
                                <Badge key={word} variant="secondary" className="cursor-pointer" onClick={() => scrollToWord(word)}>{word}</Badge>
                            ))}
                        </div>
                    </div>
                )}
                <ScrollArea className="h-[300px] pr-3">
                    {filteredCards.map(card => (
                        <div key={card._id} id={`word-${card.userLangCard}`} className="flex items-center justify-between mb-2">
                            <span>{card.userLangCard} ({card.engCard})</span>
                            <Button
                                onClick={() => handleWordSelection(card.userLangCard)}
                                variant={selectedWords.includes(card.userLangCard) ? 'default' : 'outline'}
                            >
                                {selectedWords.includes(card.userLangCard) ? 'Selected' : 'Select'}
                            </Button>
                        </div>
                    ))}
                </ScrollArea>
                <div className="flex justify-between mt-4">
                    <Button onClick={handleAutoSelect}>Auto Select</Button>
                    <Button onClick={handleConfirmSelection} disabled={selectedWords.length === 0}>Confirm</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}