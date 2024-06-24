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
}

const useQuizLogic = (quiz: QuizItem[], deckId: any): UseQuizLogicReturn => {
    const [question, setQuestion] = useState<number>(1);
    const [answers, setAnswers] = useState<{ question: number; answer: string }[]>([]);
    const [quizdone, setQuizdone] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [cards, setCards] = useState<Card[]>([])

    const fetchCards = async () => {
        await axios.get(`/decks/${deckId}`).then((response) => setCards(response.data.cards));
    };
    useEffect(() => { fetchCards() }, [])

    const saveAnswer = (e: string, q: number) => {
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
            setQuizdone(true);
        }
    }
    return { question, answers, quizdone, score, saveAnswer, cards }
}

export default useQuizLogic