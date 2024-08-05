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
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Settings } from 'lucide-react';

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 800 }

const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards } = useFetchDeck(id)
    const userId = localStorage.getItem('userId')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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

    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id)

    useEffect(() => {
        fetchNextQuizDate()
    }, [id])
    
    return (
        <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
            <CardUI className='w-full max-w-[600px]'>
                <CardHeader className='relative'>
                    {quizdone ? (
                        <>
                            <Label className='text-xl sm:text-3xl'>Quiz Result</Label>
                            <Separator className='my-2' />
                            <ConfettiExplosion {...confettiOptions} />
                        </>
                    ) : (
                        <>
                            <Progress className='h-[2px] mb-5 opacity-50' value={question * 100 / quiz.length} />
                            <CardTitle className='text-lg'>Question {question}/{quiz.length}</CardTitle>
                        </>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className='absolute top-2 right-2' data-testid="options-dialog">
                                <Settings className='w-4 h-4' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[425px] w-[90vw] max-w-[90vw] sm:w-full'>
                            <CardTitle>Options</CardTitle>
                            <div className='space-y-4 mt-4'>
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
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {quizdone ? (
                        <div className='grid gap-4 place-items-center'>
                            <span className='text-xl sm:text-2xl text-center'>{score}/{quiz.length} Questions are correct!</span>
                            {nextQuizDate && (
                                <span className='text-sm sm:text-base text-center'>Next quiz scheduled for: {nextQuizDate.toLocaleDateString()}</span>
                            )}
                            <Link to={`/view-decks/${id}`}>
                                <Button className='mt-2 sm:mt-5'>Back to Home</Button>
                            </Link>
                        </div>
                    ) : (
                        quiz.map((quizItem, index) => (
                            index + 1 === question && (
                                <Question key={index} data={quizItem} 
                                    save={(answer: string, correct: boolean, cardId: string) => 
                                        saveAnswer(answer, correct, cardId)
                                    } 
                                />
                            )
                        ))
                    )}
                </CardContent>
            </CardUI>
        </div>
    )
}

export default LearningPage;
