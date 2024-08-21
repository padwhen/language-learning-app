import React from "react";
import { Card, CardContent } from "../ui/card";
import { QuizDetail } from "@/types";
import { getUniqueQuizDetails } from "@/utils/quizUtils";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { shuffleArray } from "@/state/hooks/useMatchGame";

interface QuizData {
    nextQuizDate: string;
    quizDetails: QuizDetail[]
}

interface NextQuizCardProps {
    quizData: QuizData;
    averageTime: any;
}

interface NextQuizSectionProps {
    title: string;
    items: Array<{ label: string; value: string}>
}

export const NextQuizCard: React.FC<NextQuizCardProps> = ({ quizData, averageTime }) => {
    const details = quizData.quizDetails
    const incorrectQuizzes = getUniqueQuizDetails(details, q => !q.correct)
    const correctButSlow = getUniqueQuizDetails(details, q => q.correct && q.timeTaken > averageTime * 1000)
    const notStudiedOrOngoing = getUniqueQuizDetails(details, q => q.cardScore <= 2)
    const reviewAgain = getUniqueQuizDetails(details, q => q.cardScore <= 4 && q.cardScore > 2 && q.correct)
    const completed = getUniqueQuizDetails(details, q => q.cardScore == 5 && q.correct)

    const filterAndMapQuiz = (details: QuizDetail[], filterFn: (q: QuizDetail) => boolean) => 
        details
            .filter(filterFn)
            .map(({ cardId, cardScore, question, correctAnswer }) => ({ cardId, cardScore, question, correctAnswer }));
    
            const createQuizForReview = () => {
                const incorrectQuizzes = filterAndMapQuiz(details, q => !q.correct);
                const correctButSlow = filterAndMapQuiz(details, q => q.correct && q.timeTaken > averageTime);
                const notStudiedOrOngoing = filterAndMapQuiz(details, q => q.cardScore <= 2);
                const reviewAgain = filterAndMapQuiz(details, q => q.cardScore > 2 && q.cardScore <= 4 && q.correct);
            
                const countMap = new Map<string, number>();
                const reviewAgainSet = new Set(reviewAgain.map(item => item.question));
            
                const addToReviewArray = (items: { question: string, correctAnswer: string}[], maxCount = 2) => {
                    return items.filter(item => {
                        if (reviewAgainSet.has(item.question) && maxCount === 2) {
                            return false; 
                        }
                        const count = countMap.get(item.question) || 0;
                        if (count < maxCount) {
                            countMap.set(item.question, count + 1);
                            return true;
                        }
                        return false;
                    });
                };
            
                let reviewArray = [
                    ...addToReviewArray(incorrectQuizzes),
                    ...addToReviewArray(correctButSlow),
                    ...addToReviewArray(notStudiedOrOngoing),
                    ...addToReviewArray(reviewAgain, 1),
                    ...addToReviewArray(incorrectQuizzes),
                    ...addToReviewArray(correctButSlow),
                    ...addToReviewArray(notStudiedOrOngoing)
                ];
            
                console.log(shuffleArray(reviewArray));
            };

    return (
        <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
            <Card>
                <CardContent className="p-2 sm:p-4">
                    <h2 className="text-xl sm:text-2xl font-bold p-2 mt-2">
                        Next Quiz {format(new Date(quizData.nextQuizDate), 'dd.MM.yyyy')}
                    </h2>
                    <NextQuizSection
                        title="High Priority"
                        items={[
                            { label: 'Incorrect Quiz', value: incorrectQuizzes },
                            { label: 'Correct But Slow', value: correctButSlow },
                            { label: 'Not Studied / Ongoing', value: notStudiedOrOngoing }
                        ]}
                    />
                    <NextQuizSection
                        title="Review Again"
                        items={[
                            { label: 'Terms', value: reviewAgain}
                        ]}
                    />
                    <NextQuizSection
                        title="Completed"
                        items={[
                            { label: 'Terms', value: completed}
                        ]}
                    />
                    <Button className="mt-4 w-full text-sm sm:text-base" onClick={createQuizForReview}>
                        Review this quiz now
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

const NextQuizSection: React.FC<NextQuizSectionProps> = ({ title, items}) => (
    <>
        <h3 className={`font-bold text-blue-600 p-2 text-lg sm:text-xl`}>  
            {title}
        </h3>
        {items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-2 p-2">
                <p className="font-bold text-red-700 text-sm sm:text-base">
                    {item.label}: 
                </p>
                <p className="text-sm sm:text-base break-words">
                    {item.value}
                </p>
            </div>
        ))}
    </>
)