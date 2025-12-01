import { Card, Deck } from '@/types';


export const mockCards: Card[] = [
    { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
    { _id: '2', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 0 }
];

export const mockDecks: Deck[] = [
    {
        _id: '1',
        deckName: 'French Basics',
        deckPercentage: '50',
        deckTags: ['French'],
        cards: [
            { _id: '1', engCard: 'Hello', userLangCard: 'Bonjour', cardScore: 0 },
            { _id: '3', engCard: 'Good morning', userLangCard: 'Bonjour', cardScore: 0 },
        ],
    },
    {
        _id: '2',
        deckName: 'French Advanced',
        deckPercentage: '75',
        deckTags: ['French'],
        cards: [
            { _id: '4', engCard: 'Goodbye', userLangCard: 'Au revoir', cardScore: 0 },
        ],
    },
];

export const mockModifiedCards = [
    { 
      _id: '1', 
      engCard: 'Hello (modified)', 
      explanation_string: 'A greeting used when meeting someone' 
    },
    { 
      _id: '2', 
      engCard: 'Goodbye (modified)', 
      explanation_string: 'A farewell expression'
    }
  ]

export const createMockDeck = (overrides: Partial<Deck>): Deck => ({
    _id: '1',
    deckName: 'French Basics',
    deckPercentage: '0',
    deckTags: ['French'],
    cards: mockCards,
    ...overrides
});

export const createMockCard = (overrides: Partial<Card>): Card => ({
    _id: '1',
    engCard: 'Hello',
    userLangCard: 'Bonjour',
    cardScore: 0,
    ...overrides
});
