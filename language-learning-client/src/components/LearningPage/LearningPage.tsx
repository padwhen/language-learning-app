import React, { useEffect, useMemo, useState } from 'react';
import { Card as CardUI } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from "react-router-dom";
import useFetchDeck from '@/state/hooks/useFetchDeck';
import { generateQuiz } from '@/utils/generateQuiz';
import useQuizLogic from '@/state/hooks/useQuizLogic';
import useQuizOptions from '@/state/hooks/useQuizOptions';
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Save, AlertTriangle } from 'lucide-react';
import { QuizItem } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { IntroStep } from './Step/IntroStep';
import { NoCardNotifications } from './NoCardsNotification';
import { SettingsIntroPage } from './Step/SettingsIntroPage';
import { LearningStep } from './types';
import { PreviewPage } from './Step/PreviewPage';
import { QuizPage } from './Step/QuizPage';


export const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards, deckName } = useFetchDeck(id)
    const userId = localStorage.getItem('userId')
    const navigate = useNavigate()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
    const [showIntroAgain, setShowIntroAgain] = useState(true)
    const [quiz, setQuiz] = useState<QuizItem[]>([])
    const [savedProgress, setSavedProgress] = useState<{
        currentQuestion: number;
        answers: any[];
        score: number;
    } | null>(null)
    const [animationClass, setAnimationClass] = useState('')

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
        cardTypeToLearn
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


    // Animation helper
    const triggerAnimation = (animation: string) => {
        setAnimationClass(animation)
        setTimeout(() => setAnimationClass(''), 500)
    }


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
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (currentStep === 'quiz' && !quizdone) {
                event.preventDefault()
                event.returnValue = ''
                setIsExitDialogOpen(true)
            }
        }

        if (currentStep === 'quiz' && !quizdone) {
            window.addEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [currentStep, quizdone, setIsExitDialogOpen])

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
        triggerAnimation('animate-bounce')
        setTimeout(() => setCurrentStep('quiz'), 200)
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

    // Maybe an alert like "Are you sure to leave something something"
    const handleExitWithoutSaving = () => {
        setSavedProgress(null)
        navigate(`/view-decks/${id}`)
    }

    const nextStep = (step: LearningStep) => {
        triggerAnimation('animate-slide')
        setTimeout(() => setCurrentStep(step), 100)
    }

    if (filteredAndSortedCards.length === 0 && currentStep !== 'intro') {
        return (
            <NoCardNotifications setCurrentStep={setCurrentStep} />
        )
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'intro':
                return (
                    <IntroStep 
                        deckName={deckName} 
                        showIntroAgain={showIntroAgain} 
                        setShowIntroAgain={setShowIntroAgain} 
                        nextStep={nextStep} 
                    />
                )

            case 'settings':
                return (
                    <div>
                        <SettingsIntroPage 
                            animationClass={animationClass} 
                            cards={cards} 
                            cardsToLearn={cardsToLearn}
                            setCardsToLearn={setCardsToLearn}
                            cardTypeToLearn={cardTypeToLearn}
                            setCardTypeToLearn={setCardTypeToLearn} 
                            includeCompletedCards={includeCompletedCards}
                            setIncludeCompletedCards={setIncludeCompletedCards} 
                            triggerAnimation={triggerAnimation} 
                            nextStep={nextStep}
                        />
                    </div>
                )

            case 'preview':
                return (
                    <PreviewPage 
                        animationClass={animationClass}
                        filteredAndSortedCards={filteredAndSortedCards}
                        handleStartQuiz={handleStartQuiz}
                        nextStep={nextStep}
                    />
                )

            case 'quiz':
                return (
                    <QuizPage
                        quizdone={quizdone}
                        setIsExitDialogOpen={setIsExitDialogOpen}
                        question={question}
                        quiz={quiz}
                        isSettingsOpen={isSettingsOpen}
                        setIsSettingOpens={setIsSettingsOpen}
                        shuffleCards={shuffleCards}
                        setShuffleCards={setShuffleCards}
                        handleSaveAndExit={handleSaveAndExit}
                        score={score}
                        animationClass="animate-slideIn"
                        saveAnswer={saveAnswer}
                        nextQuizDate={nextQuizDate}
                        quizNextDate={quizNextDate}
                        id={id}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className="flex justify-center min-h-screen pt-4 sm:pt-8 lg:pt-12 p-2 sm:p-4">
            <CardUI className='w-full max-w-4xl h-full min-h-[80vh] flex flex-col'>
                {renderStep()}
            </CardUI>
            {/** There should be case where user exit the page it out of nowhere => some kinds of notifications */}
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

