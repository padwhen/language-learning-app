import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from './Question';
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"
import ConfettiExplosion from 'react-confetti-explosion';
import { Button } from '@/components/ui/button';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';

interface CardItem {
    engCard: string;
    userLangCard: string;
    cardScore: number;
    _id: string;
}

interface QuizItem {
    text: string;
    options: string[];
    answer: string;
}

const LearningPage: React.FC = () => {
    const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 800 }
    const { id } = useParams()
    const [question, setQuestion] = useState<number>(1);
    const [answers, setAnswers] = useState<{ question: number; answer: string }[]>([]);
    const [quizdone, setQuizdone] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [cards, setCards] = useState<CardItem[]>([])

    const fetchCards = async () => {
        await axios.get(`/decks/${id}`).then((response) => setCards(response.data.cards));
    };
    useEffect(() => { fetchCards() }, [])
    const quiz: QuizItem[] = cards.map((card, index) => {
        // Shuffle all cards' engCard properties except the current one
        const shuffledEngCards = cards
            .filter((c, i) => i !== index)
            .map(c => c.engCard)
            .sort(() => Math.random() - 0.5);
    
        // Take the first 3 elements from the shuffled array and add the correct answer
        const options = shuffledEngCards.slice(0, 3).concat(card.engCard);
    
        // Shuffle the options array to randomize the order
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
        return {
            text: card.userLangCard,
            options: shuffledOptions,
            answer: card.engCard
        };
    });
    
    const saveAnswer = (e: string, q: number) => {
        let newAnswers = [...answers];
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
            axios.put(`/decks/update-card/${id}`, { cards: updatedCards })
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
    
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card>
                <CardHeader>
                    {!quizdone && <div>
                        <Progress className='h-[2px] mb-5 opacity-50' value={question * 100 / quiz.length} />
                        <CardTitle className='text-lg'>Question {question}/{quiz.length}</CardTitle>
                    </div>}
                </CardHeader>
                <CardContent>
                    <div className='w-[600px]'>
                        {!quizdone && quiz.map((x, i) => {
                            if ((i + 1) === question) {
                                return <Question key={i} data={x} save={(e: any) => saveAnswer(e, (i + 1))}></Question>
                            }
                            return null;
                        })}
                        {quizdone && <div className='flex flex-col items-center'>
                            <Label className='text-3xl'>Quiz Result</Label>
                            <Separator className="my-2" />
                            <ConfettiExplosion {...confettiOptions} />
                            <span className='text-2xl'>{score}/{quiz.length} Questions are correct !</span>
                            <Link to={`/view-decks/${id}`}><Button className='mt-5'>Back to Home</Button></Link>
                        </div>}
                    </div>
                </CardContent>
            </Card>            
        </div>

    );
}

export default LearningPage;
