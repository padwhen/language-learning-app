import { useMemo } from "react";
import useQuizLogic from "@/state/hooks/useQuizLogic";
import { generateQuiz } from "@/utils/generateQuiz";
import { Link, useLocation, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import ConfettiExplosion from "react-confetti-explosion";
import { Progress } from "../ui/progress";
import { Question } from "../LearningPage/Question";
import { Button } from "../ui/button";

type ReviewCard = {
    cardId: string;
    cardScore: number;
    correctAnswer: string;
    question: string;
};

const confettiOptions = { force: 0.9, duration: 6000, particleCount: 100, width: 1600, height: 1600 }

export const ReviewPage = () => {
    const { id } = useParams()
    const location = useLocation()
    const { shuffledArray } = (location.state as { shuffledArray: ReviewCard[]})
        
    // Memoize the card count map
    const cardCountMap = useMemo(() => {
        const map: Record<string, number> = {}
        for (let i = 0; i < shuffledArray.length; i++) {
            let card = shuffledArray[i].cardId
            map[card] = (map[card] || 0) + 1
        }
        return map
    }, [shuffledArray]);

    // Memoize the transformed cards array
    const cards = useMemo(() => 
        shuffledArray.map((card) => ({
            _id: card.cardId,
            engCard: card.correctAnswer,
            userLangCard: card.question,
            cardScore: card.cardScore,
        }))
    , [shuffledArray]);

    // Memoize the quiz generation
    const quiz = useMemo(() => generateQuiz(cards), [cards]);

    const { question, quizdone, score, saveAnswer, loading } = useQuizLogic(quiz, id, true, cardCountMap);

    if (loading) return <p>Loading....</p>

    return (
        <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
            <Card className="w-full max-w-4xl h-full min-h-[80vh] flex flex-col">
                <CardHeader className="relative flex-shrink-0">
                    {quizdone ? (
                        <>
                            <Label className="text-3xl sm:text-4xl md:text-5xl font-bold">Review Vocabularies Result</Label>
                            <Separator className="my-4" />
                            <ConfettiExplosion {...confettiOptions} />
                        </>
                    ) : (
                        <>
                            <Progress className="h-2 mb-6 opacity-70" value={question * 100 / quiz.length} />
                            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">Question {question}/{quiz.length}</CardTitle>
                        </>
                    )}       
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
                    {quizdone ? (
                        <div className="grid gap-6 place-items-center">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
                                {score}/{quiz.length} Questions are correct!
                            </span>
                            <Link to={`/view-decks/${id}`}>
                                <Button className="mt-4 sm:mt-6 text-xl py-6 px-8">Back to Home</Button>
                            </Link>
                        </div>
                    ) : (
                        quiz.map((quizItem, index) => (
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
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}