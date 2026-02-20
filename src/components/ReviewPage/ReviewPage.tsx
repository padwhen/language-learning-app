import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardTitle, CardHeader } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import useQuizLogic from "@/state/hooks/useQuizLogic";
import useFetchDeck from "@/state/hooks/useFetchDeck";
import { generateQuiz } from "@/utils/generateQuiz";
import { QuizItem, Answer, Card as CardType } from "@/types";
import { Question } from "../LearningPage/Question";
import { TypeAnswerQuestion } from "../LearningPage/TypeAnswerQuestion";
import { WordScrambleQuestion } from "../LearningPage/WordScrambleQuestion";
import { ListeningQuestion } from "../LearningPage/ListeningQuestion";
import { Button } from "../ui/button";
import { useFetchNextQuizDate } from '@/state/hooks/useLearningHistoryHooks';
import {
    Target,
    TrendingUp,
    Calendar,
    Brain,
    Award,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const getReviewCards = (cards: CardType[], specificCardIds?: string[]): CardType[] => {
    if (specificCardIds && specificCardIds.length > 0) {
        // Review specific cards (e.g. from a learning report)
        const idSet = new Set(specificCardIds);
        return cards.filter(c => idSet.has(c._id));
    }

    const now = new Date();

    // Cards due for SRS review (nextReviewDate has passed), excluding fully learned (score 5)
    const dueCards = cards.filter(c =>
        c.nextReviewDate && new Date(c.nextReviewDate) <= now && c.cardScore < 5
    );
    if (dueCards.length > 0) return dueCards;

    // Fallback: cards with score 1-4 (in progress), sorted weakest first
    return cards
        .filter(c => c.cardScore >= 1 && c.cardScore < 5)
        .sort((a, b) => a.cardScore - b.cardScore);
};

export const ReviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const userId = localStorage.getItem('userId');
    const location = useLocation();

    // Accept specific card IDs from router state (e.g. from learning report)
    const [specificCardIds] = useState<string[] | undefined>(
        () => location.state?.cardIds || location.state?.shuffledArray?.map((c: CardType) => c._id) || undefined
    );

    const { cards: deckCards, deckTags } = useFetchDeck(id);

    const reviewCards = useMemo(
        () => getReviewCards(deckCards, specificCardIds),
        [deckCards, specificCardIds]
    );

    const [quiz, setQuiz] = useState<QuizItem[]>([]);

    useEffect(() => {
        if (reviewCards.length > 0 && quiz.length === 0) {
            setQuiz(generateQuiz(reviewCards, deckTags[0]));
        }
    }, [reviewCards, quiz.length]);

    const { question, answers, quizdone, score, saveAnswer, nextQuizDate: quizNextDate } = useQuizLogic(
        quiz, id, true,
        undefined, false, undefined, undefined,
        quiz.length > 0
    );
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, id);

    useEffect(() => {
        if (userId && id) {
            fetchNextQuizDate();
        }
    }, [id, quizdone]);

    if (deckCards.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading cards...</p>
            </div>
        </div>
    );

    if (reviewCards.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
                <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Nothing to review!</h2>
                <p className="text-gray-600 mb-6">
                    All your cards are up to date. Come back when cards are due for review, or learn new cards first.
                </p>
                <Link to={`/view-decks/${id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Back to Deck
                    </Button>
                </Link>
            </div>
        </div>
    );

    if (!quiz.length) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Preparing your review session...</p>
            </div>
        </div>
    );

    const accuracyRate = Math.round((score / quiz.length) * 100);
    const nextReviewDate = nextQuizDate || quizNextDate;
    const wrongAnswers = answers.filter(a => !a.correct);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
                <Card className="w-full min-h-[80vh] flex flex-col shadow-lg">
                    <CardContent className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
                        {quizdone ? (
                            <div className="w-full max-w-2xl">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center mb-4">
                                        <Award className="h-12 w-12 text-yellow-500 mr-3" />
                                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                            Review Complete!
                                        </h1>
                                    </div>
                                    <p className="text-lg text-gray-600">
                                        Great job on completing your spaced repetition review session
                                    </p>
                                </div>

                                {/* Performance Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <Card className="text-center p-4">
                                        <CardContent className="p-0">
                                            <div className="flex items-center justify-center mb-2">
                                                <Target className="h-6 w-6 text-blue-600 mr-2" />
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {score}/{quiz.length}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Correct Answers</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="text-center p-4">
                                        <CardContent className="p-0">
                                            <div className="flex items-center justify-center mb-2">
                                                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                                                <span className="text-2xl font-bold text-green-600">
                                                    {accuracyRate}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Accuracy Rate</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="text-center p-4">
                                        <CardContent className="p-0">
                                            <div className="flex items-center justify-center mb-2">
                                                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                                                <span className="text-2xl font-bold text-purple-600">
                                                    {quiz.length}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Cards Reviewed</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Wrong Answer Review */}
                                {wrongAnswers.length > 0 && (
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Review Mistakes ({wrongAnswers.length})
                                            </h3>
                                        </div>
                                        {wrongAnswers.map((answer: Answer, i: number) => {
                                            const quizItem = quiz.find(q => q.cardId === answer.cardId);
                                            return (
                                                <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                                    <p className="font-medium text-gray-900 mb-1">{quizItem?.userLangCard}</p>
                                                    <p className="text-sm text-red-600">Your answer: {answer.userAnswer}</p>
                                                    <p className="text-sm text-green-600">Correct: {answer.correctAnswer}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* SRS Algorithm Feedback */}
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5 text-purple-600" />
                                            Spaced Repetition Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    accuracyRate >= 80 ? 'bg-green-500' :
                                                    accuracyRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}></div>
                                                <span className="font-medium">Performance Level</span>
                                            </div>
                                            <Badge className={
                                                accuracyRate >= 80 ? 'bg-green-100 text-green-800' :
                                                accuracyRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }>
                                                {accuracyRate >= 80 ? 'Excellent' :
                                                 accuracyRate >= 60 ? 'Good' : 'Needs Improvement'}
                                            </Badge>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <h4 className="font-semibold text-blue-900 mb-2">Algorithm Adjustment</h4>
                                            <p className="text-sm text-blue-800">
                                                {accuracyRate >= 80 ?
                                                    "Your performance is excellent! The next review interval will be extended to reinforce long-term retention." :
                                                    accuracyRate >= 60 ?
                                                    "Good performance! The review interval will be maintained to ensure solid understanding." :
                                                    "The review interval will be shortened to help strengthen your understanding of these concepts."
                                                }
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Next Review Schedule */}
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            Next Review Schedule
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {nextReviewDate ? (
                                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="font-medium text-green-900">Next Review</p>
                                                        <p className="text-sm text-green-700">
                                                            {format(new Date(nextReviewDate), 'EEEE, MMMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">
                                                    {Math.ceil((new Date(nextReviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg text-center">
                                                <p className="text-gray-600">
                                                    No upcoming quiz scheduled. You can start a new quiz whenever you're ready!
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to={`/view-decks/${id}`}>
                                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                                            Back to Deck
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto px-8 py-3"
                                        onClick={() => window.location.reload()}
                                    >
                                        Review Again
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-2xl">
                                {/* Progress Header */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <CardTitle className="text-2xl sm:text-3xl font-bold">
                                            Review Session
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            Question {question}/{quiz.length}
                                        </Badge>
                                    </div>
                                    <Progress
                                        className="h-3 mb-4"
                                        value={(question / quiz.length) * 100}
                                    />
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Spaced Repetition Review</span>
                                        <span>{Math.round(((question - 1) / quiz.length) * 100)}% Complete</span>
                                    </div>
                                </div>

                                {/* Question Component */}
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
                                                        isReviewMode={true}
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
                                                        isReviewMode={true}
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
                                                        isReviewMode={true}
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
                                                        isReviewMode={true}
                                                    />
                                                );
                                        }
                                    })()
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
