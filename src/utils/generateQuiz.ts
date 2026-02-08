import { Card, QuizItem, QuestionType } from "@/types";
import { isSuitableForAudio } from "./answerMatching";

const langMap: Record<string, string> = {
    'finnish': 'fi-FI',
    'korean': 'ko-KR',
    'greek': 'el-GR',
    'vietnamese': 'vi-VN',
    'chinese': 'zh-CN',
    'japanese': 'ja-JP',
    'spanish': 'es-ES',
    'french': 'fr-FR',
    'german': 'de-DE',
    'italian': 'it-IT',
    'portuguese': 'pt-PT',
    'russian': 'ru-RU',
    'thai': 'th-TH',
    'arabic': 'ar-SA',
    'hindi': 'hi-IN',
    'turkish': 'tr-TR',
    'polish': 'pl-PL',
    'dutch': 'nl-NL',
    'swedish': 'sv-SE',
    'norwegian': 'nb-NO',
    'danish': 'da-DK',
};

function getQuestionType(score: number, cardText?: string): QuestionType {
    const level = Math.floor(score);
    switch (level) {
        case 0: return 'multiple-choice';
        case 1: return 'reverse-mc';
        case 2: return 'word-scramble';
        case 3: return 'type-answer';
        case 4:
        default: {
            // Only offer listening if card content is suitable for audio
            const canListen = cardText ? isSuitableForAudio(cardText) : false;
            if (canListen && Math.random() < 0.5) return 'listening';
            return 'reverse-type';
        }
    }
}

function scrambleWord(word: string): string {
    const chars = word.split('');
    for (let attempts = 0; attempts < 50; attempts++) {
        const shuffled = [...chars].sort(() => Math.random() - 0.5);
        if (shuffled.join('') !== word) return shuffled.join('');
    }
    // Fallback: reverse the string
    return chars.reverse().join('');
}

function resolveAudioLang(deckLang?: string): string | undefined {
    if (!deckLang) return undefined;
    const key = deckLang.toLowerCase().trim();
    return langMap[key] || undefined;
}

function generateMCOptions(
    cards: Card[],
    currentIndex: number,
    field: 'engCard' | 'userLangCard'
): { options: string[]; correctIndex: number } {
    const card = cards[currentIndex];
    const correctValue = card[field];

    const availableCards = cards.filter((c, i) =>
        i !== currentIndex &&
        c.engCard !== card.engCard &&
        c.userLangCard !== card.userLangCard
    );

    const numberOfWrongOptions = Math.min(3, availableCards.length);
    const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledCards.slice(0, numberOfWrongOptions).map(c => c[field]);

    const allOptions = [...wrongOptions, correctValue];
    while (allOptions.length < 4) {
        allOptions.push("");
    }

    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.findIndex(o => o === correctValue);

    return { options: shuffledOptions, correctIndex };
}

export const generateQuiz = (cards: Card[], deckLang?: string): QuizItem[] => {
    const audioLang = resolveAudioLang(deckLang);

    const allQuestions = cards.map((card, index) => {
        const questionType = getQuestionType(card.cardScore, card.userLangCard);

        switch (questionType) {
            case 'multiple-choice': {
                const { options, correctIndex } = generateMCOptions(cards, index, 'engCard');
                return {
                    userLangCard: card.userLangCard,
                    options,
                    correctAnswer: card.engCard,
                    correctIndex,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'multiple-choice' as const,
                };
            }

            case 'reverse-mc': {
                const { options, correctIndex } = generateMCOptions(cards, index, 'userLangCard');
                return {
                    userLangCard: card.engCard,
                    options,
                    correctAnswer: card.userLangCard,
                    correctIndex,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'reverse-mc' as const,
                };
            }

            case 'word-scramble': {
                return {
                    userLangCard: scrambleWord(card.userLangCard),
                    options: [] as string[],
                    correctAnswer: card.userLangCard,
                    correctIndex: -1,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'word-scramble' as const,
                };
            }

            case 'type-answer': {
                return {
                    userLangCard: card.userLangCard,
                    options: [] as string[],
                    correctAnswer: card.engCard,
                    correctIndex: -1,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'type-answer' as const,
                };
            }

            case 'reverse-type': {
                return {
                    userLangCard: card.engCard,
                    options: [] as string[],
                    correctAnswer: card.userLangCard,
                    correctIndex: -1,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'reverse-type' as const,
                };
            }

            case 'listening': {
                return {
                    userLangCard: card.userLangCard,
                    options: [] as string[],
                    correctAnswer: card.userLangCard,
                    correctIndex: -1,
                    cardId: card._id,
                    cardScore: card.cardScore,
                    questionType: 'listening' as const,
                    audioLang,
                };
            }
        }
    });

    // Prevent adjacent duplicates by shuffling while checking for adjacency
    const shuffleWithoutAdjacent = (questions: QuizItem[]): QuizItem[] => {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            const hasAdjacentDuplicates = shuffled.some((q, i) =>
                i > 0 && (q.userLangCard === shuffled[i - 1].userLangCard ||
                    q.correctAnswer === shuffled[i - 1].correctAnswer)
            );
            if (!hasAdjacentDuplicates) {
                return shuffled;
            }
            attempts++;
        }
        console.warn('Could not prevent all adjacent duplicates after maximum attempts');
        return [...questions].sort(() => Math.random() - 0.5);
    };

    return shuffleWithoutAdjacent(allQuestions);
};
