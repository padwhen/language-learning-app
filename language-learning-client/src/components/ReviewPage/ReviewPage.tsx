import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import useQuizLogic from "@/state/hooks/useQuizLogic";
import { generateQuiz } from "@/utils/generateQuiz";
import { QuizItem } from "@/types";
import { Question } from "../LearningPage/Question";
import { Button } from "../ui/button";
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';

export const ReviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const userId = localStorage.getItem('userId');
    const location = useLocation();
    const { shuffledArray } = location.state || { shuffledArray: [] };
    const [quiz, setQuiz] = useState<QuizItem[]>([]);
    
    const { question, quizdone, score, saveAnswer, nextQuizDate: quizNextDate } = useQuizLogic(quiz, id, true);
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id);

    // Fetch next quiz date on mount and when quiz is completed
    useEffect(() => {
        if (userId && id) {
            fetchNextQuizDate();
        }
    }, [id, quizdone]); // Add quizdone as a dependency

    // Memoize the quiz generation
    const quizMemo = useMemo(() => generateQuiz(shuffledArray), [shuffledArray]);

    useEffect(() => {
        if (!quizdone) {
            setQuiz(quizMemo);
        }
    }, [quizMemo, quizdone]);

    if (!quiz.length) return <p>Loading....</p>;

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-4xl mx-auto min-h-[80vh] flex flex-col">
                <CardContent className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
                    {quizdone ? (
                        <div className="grid gap-6 place-items-center">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
                                {score}/{quiz.length} Questions are correct!
                            </span>
                            <div className="text-xl sm:text-2xl text-center text-gray-600" data-testid="next-quiz-date">
                                {nextQuizDate || quizNextDate ? (
                                    <>Next quiz scheduled for: {(nextQuizDate || quizNextDate)?.toLocaleDateString()}</>
                                ) : (
                                    <>No upcoming quiz scheduled. You can start a new quiz whenever you're ready!</>
                                )}
                            </div>
                            <Link to={`/view-decks/${id}`}>
                                <Button className="mt-4 sm:mt-6 text-xl py-6 px-8">Back to Home</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Progress className="h-2 mb-6 opacity-70" value={question * 100 / quiz.length} />
                            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">Question {question}/{quiz.length}</CardTitle>
                            {quiz.map((quizItem, index) => (
                                index + 1 === question && (
                                    <Question
                                        key={index}
                                        data={quizItem}
                                        save={(answerIndex: number, correct: boolean, cardId: string) => 
                                            saveAnswer(answerIndex, correct, cardId)
                                        }
                                        isReviewMode={true}
                                    />
                                )
                            ))}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};