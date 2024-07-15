import { QuizDetail } from "@/types";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { QuizSection } from "./QuizSection";

interface QuizDetailsCardProps {
    filteredQuizDetails: QuizDetail[]
    averageTime: number | string
    hoveredCard: string | null
    setHoveredCard: React.Dispatch<React.SetStateAction<string | null>>
}

export const QuizDetailsCard: React.FC<QuizDetailsCardProps> = ({
    filteredQuizDetails,
    averageTime,
    hoveredCard,
    setHoveredCard
}) => (
    <Card className="w-full lg:w-2/3 max-h-[500px] overflow-y-auto border-none shadow-none">
        <CardContent className="p-2 sm:p-4">
            <QuizSection
                title="Correct"
                titleClass="bg-gradient-to-r from-indigo-400 via-violet-600 to-cyan-400 bg-clip-text text-transparent"
                quizzes={filteredQuizDetails.filter(quiz => quiz.correct)}
                averageTime={averageTime}
            />
            <QuizSection
                title="Incorrect"
                titleClass="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent"
                quizzes={filteredQuizDetails.filter(quiz => !quiz.correct)}
                averageTime={averageTime}
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
            />
        </CardContent>
    </Card>
)