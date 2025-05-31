import React, { useEffect, useMemo, useState } from 'react';
import { Card as CardUI, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from './Question';
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"
import ConfettiExplosion from 'react-confetti-explosion';
import { Button } from '@/components/ui/button';
import { Link, useParams, useNavigate } from "react-router-dom";
import useFetchDeck from '@/state/hooks/useFetchDeck';
import { generateQuiz } from '@/utils/generateQuiz';
import useQuizLogic from '@/state/hooks/useQuizLogic';
import useQuizOptions from '@/state/hooks/useQuizOptions';
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Input } from '../ui/input';
import { QuizItem } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { IntroStep } from './Step/IntroStep';

type LearningStep = 'intro' | 'settings' | 'preview' | 'quiz' | 'complete';

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 1600, height: 1600 }

export const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards, deckName } = useFetchDeck(id)
    const userId = localStorage.getItem('userId')
    const navigate = useNavigate()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
    const [quiz, setQuiz] = useState<QuizItem[]>([])
    const [savedProgress, setSavedProgress] = useState<{
        currentQuestion: number;
        answers: any[];
        score: number;
    } | null>(null)

    // Quiz settings
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
    const { question, quizdone, score, saveAnswer, nextQuizDate: quizNextDate, answers } = useQuizLogic(
        quiz, 
        id, 
        false, 
        savedProgress ? {
            [savedProgress.currentQuestion.toString()]: savedProgress.score
        } : undefined
    )
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id)

    // Save progress periodically
    useEffect(() => {
        if (currentStep === 'quiz' && !quizdone) {
            const saveInterval = setInterval(() => {
                setSavedProgress({
                    currentQuestion: question,
                    answers: answers,
                    score: score
                })
                toast({
                    title: "Progress saved",
                    description: "Your progress has been automatically saved.",
                    duration: 2000,
                })
            }, 300000) // Save every 5 minutes

            return () => clearInterval(saveInterval)
        }
    }, [currentStep, quizdone, question, answers, score])

    useEffect(() => {
        if (filteredAndSortedCards.length > 0 && currentStep === 'preview') {
            const newQuiz = generateQuiz(filteredAndSortedCards)
            setQuiz(newQuiz)
        }
    }, [filteredAndSortedCards, currentStep])

    useEffect(() => {
        if (userId && id) {
            fetchNextQuizDate()
        }
    }, [id, quizdone])

    const handleStartQuiz = () => {
        setCurrentStep('quiz')
    }

    const handleSaveAndExit = () => {
        setSavedProgress({
            currentQuestion: question,
            answers: answers,
            score: score
        })
        toast({
            title: "Progress saved",
            description: "You can continue later from where you left off.",
        })
        navigate(`/view-decks/${id}`)
    }

    const handleExitWithoutSaving = () => {
        setSavedProgress(null)
        navigate(`/view-decks/${id}`)
    }

    if (filteredAndSortedCards.length === 0 && currentStep !== 'intro') {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Alert className="w-full max-w-2xl">
                    <AlertTitle className="text-xl font-bold">No Cards Available</AlertTitle>
                    <AlertDescription className="text-lg">
                        All cards in this deck are currently being learned or have been completed. 
                        Check back later or adjust your quiz options to include more cards.
                    </AlertDescription>
                    <Button 
                        className="mt-4"
                        onClick={() => setCurrentStep('settings')}
                    >
                        Adjust Settings
                    </Button>
                </Alert>
            </div>
        )
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'intro':
                return (
                    <IntroStep deckName={deckName} onContinue={() => setCurrentStep('settings')} animationClass='' />
                )

            case 'settings':
                return (
                    <div className="space-y-6 p-6">
                        <h2 className="text-2xl font-bold">Quiz Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id='includeCompleted' 
                                    checked={includeCompletedCards} 
                                    onCheckedChange={(checked) => setIncludeCompletedCards(checked as boolean)}
                                    data-testid="include-completed-checkbox"
                                />
                                <label htmlFor='includeCompleted'>Include completed cards</label>
                            </div>
                            <div>
                                <Label htmlFor='cardsToLearn'>Number of cards to learn</Label>
                                <Input 
                                    id='cardsToLearn' 
                                    type='number' 
                                    min={4} 
                                    value={cardsToLearn} 
                                    onChange={(e) => {
                                        const value = Math.min(Math.max(4, Number(e.target.value)), cards.length)
                                        setCardsToLearn(value)
                                    }}
                                    max={cards.length}
                                    data-testid="cards-to-learn-input" 
                                />
                            </div>
                            <div>
                                <Label htmlFor='cardType'>Card type to learn</Label>
                                <Select 
                                    onValueChange={(value: 'All' | 'Not studied' | 'Learning' | 'Completed') => 
                                        setCardTypeToLearn(value)
                                    }
                                >
                                    <SelectTrigger data-testid="card-type-select">
                                        <SelectValue placeholder='Select card type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='All'>All Cards</SelectItem>
                                        <SelectItem value='Not studied'>Not Studied</SelectItem>
                                        <SelectItem value='Learning'>Learning</SelectItem>
                                        <SelectItem value='Completed'>Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentStep('intro')}
                            >
                                Back
                            </Button>
                            <Button 
                                onClick={() => setCurrentStep('preview')}
                            >
                                Preview Cards
                            </Button>
                        </div>
                    </div>
                )

            case 'preview':
                return (
                    <div className="space-y-6 p-6">
                        <h2 className="text-2xl font-bold">Preview Your Cards</h2>
                        <div className="space-y-4">
                            <p>You will be learning {filteredAndSortedCards.length} cards:</p>
                            <div className="grid gap-4">
                                {filteredAndSortedCards.slice(0, 5).map((card) => (
                                    <CardUI key={card._id} className="p-4">
                                        <p className="font-semibold">{card.userLangCard}</p>
                                        <p className="text-gray-600">{card.engCard}</p>
                                    </CardUI>
                                ))}
                                {filteredAndSortedCards.length > 5 && (
                                    <p className="text-center text-gray-600">
                                        ... and {filteredAndSortedCards.length - 5} more cards
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentStep('settings')}
                            >
                                Back to Settings
                            </Button>
                            <Button 
                                onClick={handleStartQuiz}
                            >
                                Start Learning
                            </Button>
                        </div>
                    </div>
                )

            case 'quiz':
                return (
                    <>
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
                                    <CardTitle className='text-2xl sm:text-3xl md:text-4xl font-bold'>
                                        Question {question}/{quiz.length}
                                    </CardTitle>
                                </>
                            )}
                            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className='absolute top-4 right-4'>
                                        <Settings className='w-6 h-6' />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Quiz Options</DialogTitle>
                                        <DialogDescription>
                                            Adjust your quiz settings or save progress
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className='space-y-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox 
                                                id='shuffleCards' 
                                                checked={shuffleCards}
                                                onCheckedChange={(checked) => setShuffleCards(checked as boolean)}
                                            />
                                            <label htmlFor='shuffleCards'>Shuffle remaining cards</label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsSettingsOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleSaveAndExit}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save & Exit
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className='flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8'>
                            {quizdone ? (
                                <div className='grid gap-6 place-items-center'>
                                    <span className='text-3xl sm:text-4xl md:text-5xl font-bold text-center'>
                                        {score}/{quiz.length} Questions are correct!
                                    </span>
                                    <div className='text-xl sm:text-2xl text-center text-gray-600'>
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
                                <>
                                    {quiz.map((quizItem, index) => (
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
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="absolute top-4 left-4"
                                        onClick={() => setIsExitDialogOpen(true)}
                                    >
                                        Exit
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
            <CardUI className='w-full max-w-4xl h-full min-h-[80vh] flex flex-col'>
                {renderStep()}
            </CardUI>

            <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Exit Quiz?
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to exit? Your progress will be lost unless you save it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsExitDialogOpen(false)}
                        >
                            Continue Learning
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleExitWithoutSaving}
                        >
                            Exit Without Saving
                        </Button>
                        <Button 
                            onClick={handleSaveAndExit}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save & Exit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

