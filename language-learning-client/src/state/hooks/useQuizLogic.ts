import { Answer, Card, QuizItem } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

interface UseQuizLogicReturn {
    question: number;
    answers: Answer[];
    quizdone: boolean;
    score: number;
    saveAnswer: (answer: string, questionNumber: number) => void;
    cards: Card[]
    nextQuizDate?: Date | null
}

const useQuizLogic = (quiz: QuizItem[], deckId: any): UseQuizLogicReturn => {
    const userId = localStorage.getItem('userId')

    const [question, setQuestion] = useState<number>(1);
    const [answers, setAnswers] = useState<{ question: number; answer: string }[]>([]);
    const [quizdone, setQuizdone] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [cards, setCards] = useState<Card[]>([])
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)

    const fetchCards = async () => {
        await axios.get(`/decks/${deckId}`).then((response) => setCards(response.data.cards));
    };

    const fetchNextQuizDate = async () => {
        try {
            const response = await axios.get(`/learning-history/next-quiz-date/${userId}/${deckId}`)
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error fetching next quiz date: ', error)
        }
    }

    useEffect(() => { fetchCards(); fetchNextQuizDate() }, [])

    const saveAnswer = async (e: string, q: number) => {
        const newAnswers = [...answers];
        newAnswers.push({
            question: q,
            answer: e
        });
        setAnswers(newAnswers);
        const isCorrect = e
        setCards(prevCards => {
            const updatedCards = [...prevCards];
            const cardIndex = question - 1;
            const updatedCard = { ...updatedCards[cardIndex] };
            updatedCard.cardScore = Math.min(Math.max(updatedCard.cardScore + (isCorrect ? 1 : -1), 0), 5);
            updatedCards[cardIndex] = updatedCard;
            axios.put(`/decks/update-card/${deckId}`, { cards: updatedCards })
            .then(response => {
                console.log("Deck updated successfully:", response.data);
            })
            .catch(error => {
                console.error("Error updating deck:", error);
            });
            return updatedCards; 
        });
        if (isCorrect) {
            setScore(score + 1);
        }
        if (question < quiz.length) {
            setQuestion(question + 1);
        }
        if (question === quiz.length) {
            console.log("Quiz completed, calling finishQuiz...")
            await finishQuiz()
            setQuizdone(true);
        }
    }

    const finishQuiz = async () => {
        try {
            const response = await axios.post(`/learning-history/save-quiz-result`, {
                userId,
                deckId,
                cardsStudied: quiz.length,
                correctAnswers: score,
                quizType: 'learn'
            })
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error saving quiz result: ', error)
        }
    }

    return { question, answers, quizdone, score, saveAnswer, cards, nextQuizDate }
}

export default useQuizLogic