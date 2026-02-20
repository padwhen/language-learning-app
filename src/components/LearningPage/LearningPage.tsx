import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card as CardUI } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from "react-router-dom";
import useFetchDeck from '@/state/hooks/useFetchDeck';
import { generateQuiz } from '@/utils/generateQuiz';
import useQuizLogic from '@/state/hooks/useQuizLogic';
import useQuizOptions from '@/state/hooks/useQuizOptions';
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Save, AlertTriangle, Play } from 'lucide-react';
import { QuizItem } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { IntroStep } from './Step/IntroStep';
import { NoCardNotifications } from './NoCardsNotification';
import { SettingsIntroPage } from './Step/SettingsIntroPage';
import { LearningStep } from './types';
import { PreviewPage } from './Step/PreviewPage';
import { QuizPage } from './Step/QuizPage';
import { useQuizProgress } from '@/state/hooks/useQuizProgress';
import { ResumeAnswerReview } from './ResumeAnswerReview';
import { motion, AnimatePresence } from 'framer-motion';


export const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards, deckName, deckTags } = useFetchDeck(id)
    const userId = localStorage.getItem('userId')
    const navigate = useNavigate()
    const { toast } = useToast()

    const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
    const [showIntroAgain, setShowIntroAgain] = useState(true)
    const [quiz, setQuiz] = useState<QuizItem[]>([])
    const [animationClass, setAnimationClass] = useState('')
    const [hasLoadedSavedProgress, setHasLoadedSavedProgress] = useState(false)
    const [showResumeDialog, setShowResumeDialog] = useState(false)
    const [progressLoadingComplete, setProgressLoadingComplete] = useState(false)

    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

    const {
        savedProgress,
        saveProgress,
        loadProgress,
        deleteProgress,
    } = useQuizProgress(userId || '', id || '')

    const filteredAndSortedCards = useMemo(() => filterCards(), [cards, includeCompletedCards, cardsToLearn, shuffleCards]);
    const { question, quizdone, score, saveAnswer, nextQuizDate: quizNextDate, answers } = useQuizLogic(
        quiz, 
        id, 
        false, 
        savedProgress ? {
            [savedProgress.currentQuestion.toString()]: savedProgress.score
        } : undefined,
        !!savedProgress, // isResumeMode - true if we have saved progress
        savedProgress ? {
            currentQuestion: savedProgress.currentQuestion,
            answers: savedProgress.answers,
            score: savedProgress.score
        } : undefined,
        savedProgress?.quizItems, // originalQuizItems for resume mode
        currentStep === 'quiz' // isQuizStarted - only start timer when actually in quiz
    )

    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id)

    // Animation helper
    const triggerAnimation = (animation: string) => {
        setAnimationClass(animation)
        setTimeout(() => setAnimationClass(''), 300)
    }

    // Load saved progress on component mount
    useEffect(() => {
        if (userId && id && !hasLoadedSavedProgress) {
            loadProgress().then(() => {
                setHasLoadedSavedProgress(true)
                setProgressLoadingComplete(true)
            })
        }
    }, [userId, id, hasLoadedSavedProgress, loadProgress])

    // Show resume dialog if saved progress exists (after loading is complete)
    useEffect(() => {
        if (progressLoadingComplete && savedProgress && !showResumeDialog) {
            setShowResumeDialog(true)
        }
    }, [])

    // Auto-save progress every 5 seconds when in quiz mode
    useEffect(() => {
        if (currentStep === 'quiz' && !quizdone && quiz.length > 0) {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current)
            }

            autoSaveIntervalRef.current = setInterval(() => {
                const progressData = {
                    currentQuestion: question + (savedProgress?.answers.length || 0), // Adjust for resumed sessions
                    answers: answers,
                    score: score,
                    quizItems: savedProgress?.quizItems || quiz, // Use original quiz items for resume context
                    settings: {
                        includeCompletedCards,
                        cardsToLearn,
                        cardTypeToLearn,
                        shuffleCards
                    }
                }
                saveProgress(progressData)
            }, 5000)
        }

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current)
            }
        }
    }, [currentStep, quizdone, question, answers, score, quiz, includeCompletedCards, cardsToLearn, cardTypeToLearn, shuffleCards, saveProgress])

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (currentStep === 'quiz' && !quizdone) {
                event.preventDefault()
                event.returnValue = ''
            }
        }

        if (currentStep === 'quiz' && !quizdone) {
            window.addEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [currentStep, quizdone])

    useEffect(() => {
        if (filteredAndSortedCards.length > 0 && currentStep === 'preview') {
            const newQuiz = generateQuiz(filteredAndSortedCards, deckTags[0])
            setQuiz(newQuiz)
        }
    }, [filteredAndSortedCards, currentStep])

    useEffect(() => {
        if (userId && id) {
            fetchNextQuizDate()
        }
    }, [id, quizdone])

    // Clean up saved progress when component unmounts (user leaves the page)
    useEffect(() => {
        return () => {
            if (savedProgress && quizdone) {
                deleteProgress()
            }
        }
    }, [savedProgress, quizdone, deleteProgress])

    const handleStartQuiz = async () => {
        // Clean up any existing saved progress when starting a new quiz
        if (savedProgress && quizdone) {
            await deleteProgress()
        }
        triggerAnimation('animate-bounce')
        setTimeout(() => setCurrentStep('quiz'), 200)
    }

    const handleSaveAndExit = async () => {
        const progressData = {
            currentQuestion: question + (savedProgress?.answers.length || 0),
            answers: answers,
            score: score,
            quizItems: savedProgress?.quizItems || quiz,
            settings: {
                includeCompletedCards,
                cardsToLearn,
                cardTypeToLearn,
                shuffleCards
            }
        }
        await saveProgress(progressData)
        navigate(`/view-decks/${id}`)
    }

    const handleExitWithoutSaving = async () => {
        await deleteProgress()
        navigate(`/view-decks/${id}`)
    }

    const handleResumeQuiz = () => {
        if (savedProgress) {
            // Restore settings
            setIncludeCompletedCards(savedProgress.settings.includeCompletedCards)
            setCardsToLearn(savedProgress.settings.cardsToLearn)
            setCardTypeToLearn(savedProgress.settings.cardTypeToLearn)
            setShuffleCards(savedProgress.settings.shuffleCards)

            // Filter out already answered questions from the quiz
            const answeredCardIds = new Set(savedProgress.answers.map(answer => answer.cardId))
            const remainingQuizItems = savedProgress.quizItems.filter(item => !answeredCardIds.has(item.cardId))
            
            setQuiz(remainingQuizItems)

            // Show resume review first if there are previous answers
            if (savedProgress.answers && savedProgress.answers.length > 0) {
                setCurrentStep('resume-review')
            } else {
                setCurrentStep('quiz')
            }
            setShowResumeDialog(false)

            toast({
                title: "Quiz resumed", 
                description: `Continuing with ${remainingQuizItems.length} remaining questions`,
                duration: 3000
            })
        }
    }

    const handleStartNewQuiz = async () => {
        await deleteProgress()
        setShowResumeDialog(false)
    }

    const nextStep = (step: LearningStep) => {
        setCurrentStep(step)
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
                        animationClass={animationClass}
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

            case 'resume-review':
                return savedProgress ? (
                    <ResumeAnswerReview
                        previousAnswers={savedProgress.answers}
                        quizItems={savedProgress.quizItems}
                        remainingQuestions={quiz.length}
                        onContinue={() => setCurrentStep('quiz')}
                    />
                ) : null

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
                        answers={answers}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className="flex justify-center min-h-screen pt-4 sm:pt-8 lg:pt-12 p-2 sm:p-4">
            <CardUI className='w-full max-w-4xl h-full min-h-[80vh] flex flex-col'>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </CardUI>
            <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Play className='w-5 h-5 text-blue-500' />
                            Resume Previous Quiz?
                        </DialogTitle>
                        <DialogDescription>
                            We found a saved quiz in progress. You were on question {savedProgress?.currentQuestion} with a score of {savedProgress?.score}
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant={'outline'} onClick={handleStartNewQuiz}>
                                Start New Quiz
                            </Button>
                            <Button onClick={handleResumeQuiz} className='flex items-center gap-2'>
                                <Play className='w-4 h-4' /> Resume Quiz
                            </Button>
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
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


