import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { QuizItem } from "@/types";
import { BookOpen, CheckCircle2, Save, Settings, X, Zap } from "lucide-react";
import ConfettiExplosion from "react-confetti-explosion";
import { Question } from "../Question";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";

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
    saveAnswer: (answerIndex: number, correct: boolean, cardId: string) => void
    id: string | undefined
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
    id
}) => {
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
                <div className={`grid gap-8 place-items-center text-center ${animationClass}`}>
                    <motion.div 
                        className="space-y-4"
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
                    <motion.div 
                        className='text-lg text-center text-gray-600 bg-gray-50 p-6 rounded-xl'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            delay: 1.5, 
                            duration: 0.6,
                            type: "spring"
                        }}>
                        {nextQuizDate || quizNextDate ? (
                            <>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 10, -10, 10, 0],
                                        }}
                                        transition={{ 
                                            delay: 2,
                                            duration: 1,
                                            ease: "easeInOut" 
                                        }}
                                    >
                                        <BookOpen className="w-5 h-5" />
                                    </motion.div>
                                    <span className="font-semibold">Next Review</span>
                                </div>
                                <span>{(nextQuizDate || quizNextDate)?.toLocaleDateString()}</span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{ 
                                            delay: 2,
                                            duration: 0.6,
                                            repeat: Infinity,
                                            repeatDelay: 2
                                        }}
                                    >
                                        <Zap className="w-5 h-5" />
                                    </motion.div>
                                    <span className="font-semibold">Ready for More!</span>
                                </div>
                                <span>You can start a new session whenever you're ready!</span>
                            </>
                        )}
                    </motion.div>
                    <motion.div
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
                </motion.div>
            )}
        </CardContent>
        </>
    )
}