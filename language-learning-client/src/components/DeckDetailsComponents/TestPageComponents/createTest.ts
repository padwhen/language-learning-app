import { createTest } from "@/ChatCompletion"
import { Card, Question } from "@/types";
import { generateSynonymMatchingQuestions, generateWordScrambleQuestions, subsetCards } from "@/utils/testUtils"

interface Passage {
    text: string;
    translation: string;
    context: string;
    vocab_hints: Record<string, string>;
    blanks: Record<string, Question>;
}

interface Test {
    passage: Passage
    questions: {
        synonym_matching: Question[]
        word_scramble: Question[]
    }
}

export const generateTest = async (cards: Card[]): Promise<Test> => {
    const subsettedCards = subsetCards(cards);
    console.log(subsettedCards)
    const response_json = await createTest(subsettedCards);
    
    let passage: Passage;

    if (response_json !== null) {
        try {
            const parsedResponse = JSON.parse(response_json);
            if (typeof parsedResponse === 'object' && parsedResponse.passage) {
                passage = parsedResponse.passage;
            } else {
                console.error('Unexpected response format:', parsedResponse);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            throw error;
        }
    } else {
        throw new Error('No response received from createTest');
    }

    const synonymQuestions = generateSynonymMatchingQuestions(subsettedCards);
    const scrambleQuestions = generateWordScrambleQuestions(subsettedCards);

    const completedTest: Test = {
        passage: passage,
        questions: {
            synonym_matching: synonymQuestions,
            word_scramble: scrambleQuestions
        }
    };

    return completedTest;
};