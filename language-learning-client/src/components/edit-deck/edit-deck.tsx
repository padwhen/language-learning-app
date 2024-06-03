import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Deck, Card } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { IoIosDoneAll, IoMdSwap } from 'react-icons/io';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ToolTip } from '@/composables/ToolTip';
import { EditCardDetails } from './FlashcardDetails';

export const EditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [deckName, setDeckName] = useState<string>('');
    const [tagsInput, setTagsInput] = useState<string>('');
    const [deckTags, setDeckTags] = useState<string[]>([]);
    const [userLang, setUserLang] = useState<string>('');
    const [modifiedCardIds, setModifiedCardIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<Deck>(`/decks/${id}`);
                if (response.data) {
                    setDeck(response.data);
                    setCards(response.data.cards);
                    setDeckName(response.data.deckName);
                    setDeckTags(response.data.deckTags);
                    setUserLang(response.data.deckTags[0]);
                } else {
                    throw new Error("Deck data not found in response");
                }
            } catch (error) {
                console.error(`Error fetching deck for deckId ${id}`, error);
            }
        };
        fetchData();
    }, [id]);

    const addCard = () => {
        const newCard: Card = { _id: uuidv4(), engCard: '', userLangCard: '', cardScore: 0 };
        setCards([...cards, newCard]);
    };

    const handleCardChange = (updatedCards: Card[]) => {
        setCards(updatedCards);
        const modifiedIds = new Set(updatedCards.filter(card => card.cardScore === 0).map(card => card._id));
        setModifiedCardIds(modifiedIds)
    };

    const handleDone = async () => {
        if (!deck) return; 
        const updatedDeck: Deck = {
            ...deck,
            deckName: deckName,
            deckTags: deckTags,
            cards: cards.map(card => ({
                ...card,
                cardScore: card._id in modifiedCardIds ? 0 : card.cardScore
            }))
        };
        try {
            const response = await axios.put(`/decks/update/${id}`, updatedDeck);
            console.log('Updated deck: ', response.data)
            window.history.back()
        } catch (error) { console.error('Error updating deck: ', error)}
    };

    const handleDeckNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeckName(event.target.value);
    };

    const handleTagsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTagsInput(event.target.value);
    };

    const handleAddTag = () => {
        if (tagsInput.trim() !== '') {
            setDeckTags([...deckTags, tagsInput.trim()]);
            setTagsInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = deckTags.filter(tag => tag !== tagToRemove);
        setDeckTags(updatedTags);
    };

    const handleUserLangChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLang = event.target.value.trim();
        setUserLang(newLang);
        const updatedTags = [...deckTags];
        updatedTags[0] = newLang;
        setDeckTags(updatedTags);
    };

    const handleSwapTerms = (index: number) => {
        setCards(prevCards => {
            return prevCards.map((card, idx) => {
                if (idx === index) {
                    return {
                        ...card,
                        engCard: card.userLangCard,
                        userLangCard: card.engCard
                    };
                }
                return card;
            });
        });
    };

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
                    <Input type="text" value={deckName} size={80} className="mt-1 text-xl" onChange={handleDeckNameChange} />
                </div>
                <div className="flex flex-row gap-4">
                    <span className="w-3/4">
                        <Label htmlFor="tags" className="text-xl">Tags</Label>
                        <div className="flex items-center mt-1 space-x-2">
                            {deckTags.map(tag => (
                                <div key={tag} className="flex items-center bg-gray-200 rounded-lg px-2 py-1">
                                    <span className="mr-2">{tag}</span>
                                    <button type="button" onClick={() => handleRemoveTag(tag)}>&times;</button>
                                </div>
                            ))}
                            <Input type="text" value={tagsInput} onChange={handleTagsInputChange} size={20} className="text-xl" />
                            <button type="button" onClick={handleAddTag}>Add</button>
                        </div>
                    </span>
                    <span className="w-1/4">
                        <Label htmlFor="language" className="text-xl">Language</Label>
                        <Input type="text" value={userLang} size={80} className="mt-1 text-xl" onChange={handleUserLangChange} />
                    </span>
                </div>
                <div className="flex justify-between pt-4">
                    <Button variant="outline" className="text-lg text-gray-500" size="lg">Import</Button>
                    <div className="flex items-center">
                        <div className="cursor-pointer" onClick={() => cards.forEach((_card, index) => handleSwapTerms(index))}>
                            <ToolTip trigger={<IoMdSwap />} content="Swap terms for all cards" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-8 pt-16">
                    <EditCardDetails cards={cards} userLang={userLang} onChange={handleCardChange} />
                    <div className="w-full rounded-xl h-34 flex flex-col cursor-pointer" onClick={addCard}>
                        <span className="flex justify-center items-center">
                            <h1 className="text-3xl border-b-4 pb-1 hover:border-blue-500">+ Add Card</h1>
                        </span>
                    </div>
                </div>
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

