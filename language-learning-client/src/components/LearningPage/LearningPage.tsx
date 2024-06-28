import React, { useEffect, useState } from 'react';
import { Card as CardUI, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from './Question';
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"
import ConfettiExplosion from 'react-confetti-explosion';
import { Button } from '@/components/ui/button';
import { Link, useParams } from "react-router-dom";
import useFetchDeck from '@/state/hooks/useFetchDeck';
import { generateQuiz } from '@/utils/generateQuiz';
import useQuizLogic from '@/state/hooks/useQuizLogic';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import useQuizOptions from '@/state/hooks/useQuizOptions';
import axios from 'axios';

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 800 }

const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards } = useFetchDeck(id)
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)
    const userId = localStorage.getItem('userId')

    const {
        includeCompletedCards,
        setIncludeCompletedCards,
        cardsToLearn,
        setCardsToLearn,
        setCardTypeToLearn,
        shuffleCards,
        setShuffleCards,
        filterCards,
    } = useQuizOptions(cards)

    const filteredAndSortedCards = filterCards()
    const quiz = generateQuiz(filteredAndSortedCards)
    const { question, quizdone, score, saveAnswer } = useQuizLogic(quiz, id)

    useEffect(() => {
        const fetchNextQuizDate = async () => {
            try {
                const response = await axios.get(`/learning-history/next-quiz-date/${userId}/${id}`)
                setNextQuizDate(new Date(response.data.nextQuizDate))
            } catch (error) {
                console.error('Error fetching next quiz date: ', error)
            }
        }
        fetchNextQuizDate()
    }, [id])
    
    return (
        <div className="flex justify-center items-center min-h-screen">
            <CardUI>
                <CardHeader>
                    {quizdone ? (
                        <>
                            <Label className='text-3xl'>Quiz Result</Label>
                            <Separator className='my-2' />
                            <ConfettiExplosion {...confettiOptions} />
                        </>
                    ) : (
                        <>
                            <Progress className='h-[2px] mb-5 opacity-50' value={question * 100 / quiz.length} />
                            <CardTitle className='text-lg'>Question {question}/{quiz.length}</CardTitle>
                        </>
                    )}
                </CardHeader>
                <CardContent className='w-[600px]'>
                    {quizdone ? (
                        <div className='flex flex-col items-center'>
                            <span className='text-2xl'>{score}/{quiz.length} Questions are correct!</span>
                            {nextQuizDate && (
                                <span className='mt-2'>Next quiz scheduled for: {nextQuizDate.toLocaleDateString()}</span>
                            )}
                            <Link to={`/view-decks/${id}`}>
                                <Button className='mt-5'>Back to Home</Button>
                            </Link>
                        </div>
                    ) : (
                        quiz.map((quizItem, index) => (
                            index + 1 === question && (
                                <Question key={index} data={quizItem} save={(e: string) => saveAnswer(e, question)} />
                            )
                        ))
                    )}
                </CardContent>
            </CardUI>
            <CardUI className='w-[300px] ml-8'>
                <CardHeader>
                    <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='includeCompleted' 
                                checked={includeCompletedCards} 
                                onCheckedChange={(checked) => setIncludeCompletedCards(checked as boolean)} 
                                data-testid="include-completed-checkbox"
                                />
                        <label htmlFor='includeCompleted'>Include completed cards</label>
                    </div>
                                        <div className='flex items-center space-x-2'>
                        <Checkbox id='shuffleCards' checked={shuffleCards}
                                onCheckedChange={(checked) => setShuffleCards(checked as boolean)}
                                data-testid="shuffle-cards-checkbox"
                                />
                        <label htmlFor='shuffleCards'>Shuffle Cards</label>
                    </div>
                    <div>
                        <Label htmlFor='cardsToLearn'>Number of cards to learn</Label>
                        <Input id='cardsToLearn' type='number' 
                                min={4} value={cardsToLearn} 
                                onChange={(e) => setCardsToLearn(Number(e.target.value))} max={cards.length}
                                data-testid="cards-to-learn-input" />
                    </div>
                    <div>
                        <Label htmlFor='cardType'>Card type to learn</Label>
                        <Select onValueChange={(value: 'All' | 'Not studied' | 'Learning' | 'Completed') => setCardTypeToLearn(value)}>
                            <SelectTrigger data-testid="card-type-select">
                                <SelectValue placeholder='Select card type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='All' data-testid="card-type-option-all">All Cards</SelectItem>
                                <SelectItem value='Not studied' data-testid="card-type-option-not-studied">Not Studied</SelectItem>
                                <SelectItem value='Learning' data-testid="card-type-option-learning">Learning</SelectItem>
                                <SelectItem value='Completed' data-testid="card-type-option-completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </CardUI>
        </div>
    )
}

export default LearningPage;
