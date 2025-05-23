import React, { useEffect, useMemo, useState } from 'react';
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
import useQuizOptions from '@/state/hooks/useQuizOptions';
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Input } from '../ui/input';
import { QuizItem } from '@/types';

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 1600, height: 1600 }

export const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards } = useFetchDeck(id)
    const userId = localStorage.getItem('userId')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [quiz, setQuiz] = useState<QuizItem[]>([])

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

    const filteredAndSortedCards = useMemo(() => filterCards(), [cards, includeCompletedCards, cardsToLearn, shuffleCards]);
    const { question, quizdone, score, saveAnswer, nextQuizDate: quizNextDate } = useQuizLogic(quiz, id)
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id)

    useEffect(() => {
        if (filteredAndSortedCards.length > 0) {
            const newQuiz = generateQuiz(filteredAndSortedCards)
            setQuiz(newQuiz)
        }
    }, [
        filteredAndSortedCards,
        includeCompletedCards,  
        cardsToLearn,
        shuffleCards
    ])

    useEffect(() => {
        if (userId && id) {
            fetchNextQuizDate()
        }
    }, [id, quizdone])
    
    if (filteredAndSortedCards.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Alert className="w-full max-w-2xl">
                    <AlertTitle className="text-xl font-bold">No Cards Available</AlertTitle>
                    <AlertDescription className="text-lg">
                        All cards in this deck are currently being learned or have been completed. 
                        Check back later or adjust your quiz options to include more cards.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
            <CardUI className='w-full max-w-4xl h-full min-h-[80vh] flex flex-col'>
                <CardHeader className='relative flex-shrink-0'>
                    {quizdone ? (
                        <>
                            <Label className='text-3xl sm:text-4xl md:text-5xl font-bold'>Quiz Result</Label>
                            <Separator className='my-4' />
                            <ConfettiExplosion {...confettiOptions} />
                        </>
                    ) : (
                        <>
                            <Progress className='h-2 mb-6 opacity-70' value={question * 100 / quiz.length} />
                            <CardTitle className='text-2xl sm:text-3xl md:text-4xl font-bold'>Question {question}/{quiz.length}</CardTitle>
                        </>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className='absolute top-4 right-4' data-testid="options-dialog">
                                <Settings className='w-6 h-6' />
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
                <CardContent className='flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8'>
                    {quizdone ? (
                        <div className='grid gap-6 place-items-center'>
                            <span className='text-3xl sm:text-4xl md:text-5xl font-bold text-center'>{score}/{quiz.length} Questions are correct!</span>
                            <div className='text-xl sm:text-2xl text-center text-gray-600' data-testid="next-quiz-date">
                                {nextQuizDate || quizNextDate ? (
                                    <>Next quiz scheduled for: {(nextQuizDate || quizNextDate)?.toLocaleDateString()}</>
                                ) : (
                                    <>No upcoming quiz scheduled. You can start a new quiz whenever you're ready!</>
                                )}
                            </div>
                            <Link to={`/view-decks/${id}`}>
                                <Button className='mt-4 sm:mt-6 text-xl py-6 px-8'>Back to Home</Button>
                            </Link>
                        </div>
                    ) : (
                        quiz.map((quizItem, index) => (
                            index + 1 === question && (
                                <Question 
                                    key={index} 
                                    data={quizItem} 
                                    save={(answerIndex: number, correct: boolean, cardId: string) => 
                                        saveAnswer(answerIndex, correct, cardId)
                                    } 
                                    isReviewMode={false}
                                />
                            )
                        ))
                    )}
                </CardContent>
            </CardUI>
        </div>
    )
}

