import axios from 'axios';
import { useState, useEffect } from 'react';


export interface RecentlyStudiedCard {
    _id: string;
    engCard: string;
    userLangCard: string;
    cardScore: number;
    deck: string;
    favorite: boolean;
}

const useRecentlyStudiedCards = () => {
    const [cards, setCards] = useState<RecentlyStudiedCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecentlyStudiedCards = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('/recently-studied')

            if (!response.data) {
                // If API fails, fall back to mock data for development
                console.warn('API failed, using mock data for mini-games');
                const mockCards: RecentlyStudiedCard[] = [
                    {
                        _id: '1',
                        engCard: 'house',
                        userLangCard: 'talo',
                        cardScore: 3,
                        deck: 'Basic Vocabulary',
                        favorite: false
                    },
                    {
                        _id: '2',
                        engCard: 'cat',
                        userLangCard: 'kissa',
                        cardScore: 2,
                        deck: 'Animals',
                        favorite: true
                    },
                    {
                        _id: '3',
                        engCard: 'water',
                        userLangCard: 'vesi',
                        cardScore: 4,
                        deck: 'Basic Vocabulary',
                        favorite: false
                    },
                    {
                        _id: '4',
                        engCard: 'book',
                        userLangCard: 'kirja',
                        cardScore: 1,
                        deck: 'Objects',
                        favorite: false
                    },
                    {
                        _id: '5',
                        engCard: 'red',
                        userLangCard: 'punainen',
                        cardScore: 5,
                        deck: 'Colors',
                        favorite: false
                    },
                    {
                        _id: '6',
                        engCard: 'good',
                        userLangCard: 'hyvä',
                        cardScore: 2,
                        deck: 'Adjectives',
                        favorite: true
                    },
                    {
                        _id: '7',
                        engCard: 'eat',
                        userLangCard: 'syödä',
                        cardScore: 3,
                        deck: 'Verbs',
                        favorite: false
                    },
                    {
                        _id: '8',
                        engCard: 'big',
                        userLangCard: 'iso',
                        cardScore: 1,
                        deck: 'Adjectives',
                        favorite: false
                    }
                ];
                setCards(mockCards);
                return;
            }

            setCards(response.data.cards || []);
        } catch (err) {
            console.error('Error fetching recently studied cards:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cards');
            
            // Fall back to mock data on error
            const mockCards: RecentlyStudiedCard[] = [
                {
                    _id: '1',
                    engCard: 'house',
                    userLangCard: 'talo',
                    cardScore: 3,
                    deck: 'Basic Vocabulary',
                    favorite: false
                },
                {
                    _id: '2',
                    engCard: 'cat',
                    userLangCard: 'kissa',
                    cardScore: 2,
                    deck: 'Animals',
                    favorite: true
                },
                {
                    _id: '3',
                    engCard: 'water',
                    userLangCard: 'vesi',
                    cardScore: 4,
                    deck: 'Basic Vocabulary',
                    favorite: false
                },
                {
                    _id: '4',
                    engCard: 'book',
                    userLangCard: 'kirja',
                    cardScore: 1,
                    deck: 'Objects',
                    favorite: false
                }
            ];
            setCards(mockCards);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentlyStudiedCards();
    }, []);

    return {
        cards,
        loading,
        error,
        refetch: fetchRecentlyStudiedCards
    };
};

export default useRecentlyStudiedCards;
