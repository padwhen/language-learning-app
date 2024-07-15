import { QuizDetail } from "@/types";
import { getSpeedCategory, getSpeedCategoryClassName } from "@/utils/quizUtils";
import React from "react";

interface QuizSectionProps {
    title: string;
    titleClass: string;
    quizzes: QuizDetail[];
    averageTime: string | number;
    hoveredCard?: string | null
    setHoveredCard?: React.Dispatch<React.SetStateAction<string | null>>
}

export const QuizSection: React.FC<QuizSectionProps> = ({
    title,
    titleClass,
    quizzes,
    averageTime,
    hoveredCard,
    setHoveredCard
}) => (
    <>
        <h2 className={`text-2xl sm:text-3xl font-bold my-2 ${titleClass}`}>
            {title}
        </h2>
        {quizzes.map((quiz) => (
            <div key={quiz._id} className="mb-2 p-2 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:flex-wrap">
                    <span className="font-bold p-2 text-lg sm:text-xl">{quiz.question}</span>
                    <span className={`${getSpeedCategoryClassName(getSpeedCategory(quiz.timeTaken, averageTime))} text-sm sm:text-base`}>
                        {getSpeedCategory(quiz.timeTaken, averageTime)}
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 p-2">
                    <h1 className="text-blue-700 text-sm sm:text-base">
                        {quiz.correct ? "Your choice/Correct answer" : "Your choice: "}
                    </h1>
                    <p className="text-sm sm:text-base">{quiz.correct ? quiz.correctAnswer : quiz.userAnswer}</p>
                    {!quiz.correct && (
                        <>
                            <h1 className="text-blue-700 text-sm sm:text-base mt-2 sm:mt-0">Correct Answer: </h1>
                            <span
                                className={`ml-2 text-sm sm:text-base ${hoveredCard === quiz._id ? '' : 'blur-sm'}`} 
                                onMouseEnter={() => setHoveredCard && setHoveredCard(quiz._id)}
                                onMouseLeave={() => setHoveredCard && setHoveredCard(null)}
                            >
                                {quiz.correctAnswer}
                            </span>
                        </>
                    )}
                </div>
            </div>
        ))}
    </>
)