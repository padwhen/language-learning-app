import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface ReviewSessionPreviewProps {
    nextQuizDate: string;
    totalCards: number;
    cardsToReview: number;
    learningCards: number;
    completedCards: number;
    averageAccuracy: number;
    estimatedTime: number;
}

export const ReviewSessionPreview: React.FC<ReviewSessionPreviewProps> = ({
    nextQuizDate,
    totalCards,
    cardsToReview,
    learningCards,
    completedCards,
    averageAccuracy,
    estimatedTime
}) => {
    const reviewProgress = (cardsToReview / totalCards) * 100;
    const learningProgress = (learningCards / totalCards) * 100;
    const completionProgress = (completedCards / totalCards) * 100;

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 80) return "text-green-600";
        if (accuracy >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getAccuracyBadge = (accuracy: number) => {
        if (accuracy >= 80) return "bg-green-100 text-green-800";
        if (accuracy >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Review Session
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Next Review Date */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-900">Next Review</p>
                            <p className="text-sm text-gray-600">
                                {format(new Date(nextQuizDate), 'EEEE, MMMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {Math.ceil((new Date(nextQuizDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                </div>

                {/* Card Distribution */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Card Distribution
                    </h3>
                    
                    <div className="space-y-3">
                        {/* Cards to Review */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm font-medium">Cards to Review</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{cardsToReview}</span>
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                    {reviewProgress.toFixed(0)}%
                                </Badge>
                            </div>
                        </div>
                        <Progress value={reviewProgress} className="h-2" />

                        {/* Learning Cards */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">Learning Cards</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{learningCards}</span>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                    {learningProgress.toFixed(0)}%
                                </Badge>
                            </div>
                        </div>
                        <Progress value={learningProgress} className="h-2" />

                        {/* Completed Cards */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium">Completed Cards</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{completedCards}</span>
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                    {completionProgress.toFixed(0)}%
                                </Badge>
                            </div>
                        </div>
                        <Progress value={completionProgress} className="h-2" />
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Average Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getAccuracyColor(averageAccuracy)}`}>
                                {averageAccuracy.toFixed(0)}%
                            </span>
                            <Badge className={getAccuracyBadge(averageAccuracy)}>
                                {averageAccuracy >= 80 ? "Excellent" : 
                                 averageAccuracy >= 60 ? "Good" : "Needs Work"}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Estimated Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                {estimatedTime} min
                            </span>
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                ~{Math.round(estimatedTime / cardsToReview * 60)}s per card
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* SRS Algorithm Info */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Spaced Repetition System</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Your review schedule is optimized using spaced repetition to maximize long-term retention.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Review Interval:</span>
                            <span className="font-medium">1-30 days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Performance Based:</span>
                            <span className="font-medium">Yes</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
