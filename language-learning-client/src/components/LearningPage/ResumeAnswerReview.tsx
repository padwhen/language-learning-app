import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Answer, QuizItem } from '@/types';

interface ResumeAnswerReviewProps {
    previousAnswers: Answer[];
    quizItems: QuizItem[];
    onContinue: () => void;
    remainingQuestions: number;
}

export const ResumeAnswerReview: React.FC<ResumeAnswerReviewProps> = ({
    previousAnswers,
    quizItems,
    onContinue,
    remainingQuestions
}) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-blue-600">
                    Resume Quiz - Previous Answers
                </CardTitle>
                <p className="text-lg text-gray-600 mt-2">
                    You answered {previousAnswers.length} questions before. Here's your progress:
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-4 max-w-2xl mx-auto">
                    {previousAnswers.map((answer, index) => {
                        const quizItem = quizItems[answer.question - 1];
                        const isCorrect = answer.correct;
                        const timeInSeconds = (answer.timeTaken / 1000).toFixed(1);
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`border rounded-lg p-4 ${
                                    isCorrect 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-red-200 bg-red-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-700">
                                                Question {answer.question}:
                                            </span>
                                            {isCorrect ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <p className="text-lg font-medium text-gray-800">
                                                {quizItem?.userLangCard}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-600">Your answer: </span>
                                                <span className={`font-medium ${
                                                    isCorrect ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    {answer.userAnswer}
                                                </span>
                                            </div>
                                            
                                            {!isCorrect && (
                                                <div>
                                                    <span className="text-sm text-gray-600">Correct answer: </span>
                                                    <span className="font-medium text-green-700">
                                                        {answer.correctAnswer}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{timeInSeconds}s</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div 
                    className="text-center mt-8 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: previousAnswers.length * 0.1 + 0.3 }}
                >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 font-medium">
                            Ready to continue? You have {remainingQuestions} questions remaining.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={onContinue}
                        size="lg"
                        className="px-8 py-3 text-lg"
                    >
                        Continue Quiz
                    </Button>
                </motion.div>
            </CardContent>
        </div>
    );
}; 