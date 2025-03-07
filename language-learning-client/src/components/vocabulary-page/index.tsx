import { DeckContext } from "@/contexts/DeckContext"
import { useContext, useEffect, useState } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Deck, ChangeEvent } from "@/types"
import { useDebounce } from "@uidotdev/usehooks"
import { Input } from "../ui/input"

export const VocabularyPage = () => {
    const { decks } = useContext(DeckContext)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true)
            const newFilterDecks = decks.map(deck => ({
                ...deck,
                cards: deck.cards.filter(card => 
                    card.engCard.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                    card.userLangCard.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                )
            })).filter(deck => deck.cards.length > 0)
            setFilteredDecks(newFilterDecks)
            setIsSearching(false)
        } else {
            setFilteredDecks(decks)
        }
    }, [debouncedSearchTerm, decks])

    const handleSearchChange = (e: ChangeEvent) => {
        setSearchTerm(e.target.value)
    }

    const highlightText = (text: string) => {
        if (!searchTerm) return text;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
        return (
            <span>
                {parts.map((part, index) => 
                    part.toLowerCase() === searchTerm.toLowerCase()
                    ? <span key={index} className="bg-yellow-200">{part}</span>
                    : part
                )}
            </span>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold p-4">All saved terms & definitions in decks 📚</h1>
                <form className="relative flex-grow max-w-md">
                    <Input type="text"
                            placeholder="Find any term/definition..."
                            className="w-full pl-3 pr-10 py-2 rounded-full
                            border border-transparent focus:outline-none focus:border-gray-300
                            focus:ring-2 focus:ring-gray-500 transition-all duration-200 ease-in-out"
                            value={searchTerm}
                            onChange={handleSearchChange}
                    />
                    <button disabled={isSearching} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isSearching ? (
                            "..."
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg> 
                        )}
                    </button>
                </form>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDecks.map((deck) => (
                        <Card key={deck._id} className="flex flex-col">
                            <CardHeader className="bg-blue-400 rounded py-3">
                                <h2 className="text-xl font-semibold mb-2 text-white text-center items-center flex">
                                    {deck.deckName} - {deck.cards.filter((card) => card.cardScore == 5).length} / {deck.cards.length} cards completed
                                </h2>
                            </CardHeader>
                            <CardContent className="flex-grow p-4">
                                {deck.cards.map((card) => (
                                    <div key={card._id}
                                        className={`p-2 m-2 rounded ${card.cardScore === 5 ? 'bg-green-100' : 'bg-gray-100'}`}
                                    >
                                        <p><span className="font-medium">{highlightText(card.userLangCard)}</span> - {highlightText(card.engCard)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}