import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 800 }

const LearningPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { cards } = useFetchDeck(id)
    
    const quiz = generateQuiz(cards)
    const { question, quizdone, score, saveAnswer } = useQuizLogic(quiz, id)
    
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card>
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
            </Card>
        </div>
    )
}

export default LearningPage;
