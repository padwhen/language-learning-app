import React from "react";
import { Card, CardContent } from "../ui/card";
import { QuizDetail } from "@/types";
import { getUniqueQuizDetails } from "@/utils/quizUtils";
import { format } from "date-fns";
import { Button } from "../ui/button";

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
                    <Button className="mt-4 w-full text-sm sm:text-base">
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