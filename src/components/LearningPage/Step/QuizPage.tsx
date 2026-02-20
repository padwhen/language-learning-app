import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QuizItem, Answer } from "@/types";
import { CheckCircle2, Save, Settings, X, Zap, Target, TrendingUp, Calendar, BookOpen, AlertCircle } from "lucide-react";
import ConfettiExplosion from "react-confetti-explosion";
import { Question } from "../Question";
import { TypeAnswerQuestion } from "../TypeAnswerQuestion";
import { WordScrambleQuestion } from "../WordScrambleQuestion";
import { ListeningQuestion } from "../ListeningQuestion";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import { format } from "date-fns";

interface QuizPageProps {
    quizdone: boolean;
    setIsExitDialogOpen: (isExit: boolean) => void;
    question: number;
    quiz: QuizItem[];
    setIsSettingOpens: (isOpen: boolean) => void;
    isSettingsOpen: boolean;
    shuffleCards: boolean;
    setShuffleCards: React.Dispatch<React.SetStateAction<boolean>>
    handleSaveAndExit: () => void
    score: number;
    animationClass: string
    nextQuizDate: Date | null | undefined
    quizNextDate: Date | null | undefined
    saveAnswer: (answerIndex: number, correct: boolean, cardId: string, userAnswerText?: string, isPartial?: boolean) => void
    id: string | undefined
    answers: Answer[]
}

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 1600, height: 1600 }


export const QuizPage: React.FC<QuizPageProps> = ({
    quizdone,
    setIsExitDialogOpen,
    question,
    quiz,
    setIsSettingOpens,
    isSettingsOpen,
    shuffleCards,
    setShuffleCards,
    handleSaveAndExit,
    score,
    animationClass,
    nextQuizDate,
    quizNextDate,
    saveAnswer,
    id,
    answers
}) => {
    const wrongAnswers = answers.filter(a => !a.correct);
    return (
        <>
        <CardHeader className="relative flex-shrink-0">
            {quizdone ? (
                <>
                <div className="text-center space-y-4">
                    <motion.div 
                        className="flex justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "string",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                    >
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-white" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Label className='text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                            Amazing Work! 🎉
                        </Label>
                    </motion.div>
                </div>
                <Separator className='my-4' />
                <ConfettiExplosion {...confettiOptions} />
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Button 
                            variant="ghost"
                            onClick={() => setIsExitDialogOpen(true)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">
                                {question} / {quiz.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                questions
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsSettingOpens(true)}>
                            <Settings className="w-6 h-6 text-gray-600" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Progress
                            className="h-3 bg-gray-200 rounded-full overflow-hidden"
                            value={question * 100 / quiz.length}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${question * 100 / quiz.length}%` }}
                        >
                        </div>
                    </div>
                </div>
            )}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingOpens}>
                <DialogContent className="max-w-md">
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
                            onClick={() => setIsSettingOpens(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveAndExit}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4" />
                            Save & Exit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
            {quizdone ? (
                <div className={`w-full max-w-4xl mx-auto space-y-8 ${animationClass}`}>
                    {/* Header */}
                    <motion.div 
                        className="text-center space-y-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <motion.div 
                            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            {score} / {quiz.length}
                        </motion.div>
                        <motion.div 
                            className="text-xl text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            {score === quiz.length ? "Perfect score! 🌟" : 
                            score >= quiz.length * 0.8 ? "Great job! 👏" :
                            score >= quiz.length * 0.6 ? "Good effort! 👍" :
                            "Keep practicing! 💪"}
                        </motion.div>
                    </motion.div>

                    {/* Performance Summary Cards */}
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                    >
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Target className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="text-2xl font-bold text-blue-600">
                                    {score}/{quiz.length}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Correct Answers</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                                <span className="text-2xl font-bold text-green-600">
                                    {Math.round((score / quiz.length) * 100)}%
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Accuracy Rate</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <div className="flex items-center justify-center mb-2">
                                <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
                                <span className="text-2xl font-bold text-purple-600">
                                    {quiz.length}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Cards Studied</p>
                        </div>
                    </motion.div>


                    {/* Wrong Answer Review */}
                    {wrongAnswers.length > 0 && (
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Review Mistakes ({wrongAnswers.length})
                                </h3>
                            </div>
                            {wrongAnswers.map((answer, i) => {
                                const quizItem = quiz.find(q => q.cardId === answer.cardId);
                                return (
                                    <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                        <p className="font-medium text-gray-900 mb-1">{quizItem?.userLangCard}</p>
                                        <p className="text-sm text-red-600">Your answer: {answer.userAnswer}</p>
                                        <p className="text-sm text-green-600">Correct: {answer.correctAnswer}</p>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Next Review Schedule */}
                    <motion.div
                        className="bg-white p-6 rounded-xl shadow-sm border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Next Review Schedule</h3>
                        </div>
                        
                        {nextQuizDate || quizNextDate ? (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">Next Review</p>
                                        <p className="text-sm text-green-700">
                                            {nextQuizDate || quizNextDate ? 
                                                (() => {
                                                    try {
                                                        const date = new Date((nextQuizDate || quizNextDate)!);
                                                        return isNaN(date.getTime()) ? 'Not scheduled' : format(date, 'EEEE, MMMM dd, yyyy');
                                                    } catch {
                                                        return 'Not scheduled';
                                                    }
                                                })() : 'Not scheduled'}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    {nextQuizDate || quizNextDate ? 
                                        (() => {
                                            try {
                                                const date = new Date((nextQuizDate || quizNextDate)!);
                                                return isNaN(date.getTime()) ? 0 : Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                            } catch {
                                                return 0;
                                            }
                                        })() : 0} days
                                </Badge>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{ 
                                            duration: 0.6,
                                            repeat: Infinity,
                                            repeatDelay: 2
                                        }}
                                    >
                                        <Zap className="w-5 h-5 text-gray-600" />
                                    </motion.div>
                                    <span className="font-semibold text-gray-700">Ready for More!</span>
                                </div>
                                <p className="text-gray-600">You can start a new session whenever you're ready!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            delay: 2,
                            type: "spring",
                            stiffness: 100
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to={`/view-decks/${id}`}>
                            <Button className='text-xl py-6 px-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200'>
                                Continue Learning 🚀
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            ) : (
                <motion.div 
                    className={`w-full ${animationClass}`}
                    key={question} 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                        duration: 0.5
                    }}
                >
                    {quiz.map((quizItem, index) => (
                        index + 1 === question && (() => {
                            switch (quizItem.questionType) {
                                case 'word-scramble':
                                    return (
                                        <WordScrambleQuestion
                                            key={index}
                                            data={quizItem}
                                            save={(answerIndex: number, correct: boolean, cardId: string, _cardScore: number, userAnswerText?: string, isPartial?: boolean) =>
                                                saveAnswer(answerIndex, correct, cardId, userAnswerText, isPartial)
                                            }
                                            isReviewMode={false}
                                        />
                                    );
                                case 'listening':
                                    return (
                                        <ListeningQuestion
                                            key={index}
                                            data={quizItem}
                                            save={(answerIndex: number, correct: boolean, cardId: string, _cardScore: number, userAnswerText?: string, isPartial?: boolean) =>
                                                saveAnswer(answerIndex, correct, cardId, userAnswerText, isPartial)
                                            }
                                            isReviewMode={false}
                                        />
                                    );
                                case 'type-answer':
                                case 'reverse-type':
                                    return (
                                        <TypeAnswerQuestion
                                            key={index}
                                            data={quizItem}
                                            save={(answerIndex: number, correct: boolean, cardId: string, _cardScore: number, userAnswerText?: string, isPartial?: boolean) =>
                                                saveAnswer(answerIndex, correct, cardId, userAnswerText, isPartial)
                                            }
                                            isReviewMode={false}
                                        />
                                    );
                                case 'multiple-choice':
                                case 'reverse-mc':
                                default:
                                    return (
                                        <Question
                                            key={index}
                                            data={quizItem}
                                            save={(answerIndex: number, correct: boolean, cardId: string) =>
                                                saveAnswer(answerIndex, correct, cardId)
                                            }
                                            isReviewMode={false}
                                            currentQuestionIndex={question}
                                            totalQuestions={quiz.length}
                                        />
                                    );
                            }
                        })()
                    ))}
                </motion.div>
            )}
        </CardContent>
        </>
    )
}