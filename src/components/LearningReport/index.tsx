import { useState } from "react"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom"
import { useFetchQuizHistory } from "@/state/hooks/useFetchQuizHistory"
// import { QuizDetail } from "@/types" // Not needed in this component
import { getSpeedCategory, getSpeedCategoryClassName } from "@/utils/quizUtils"
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react"
import { ReviewSessionPreview } from "./ReviewSessionPreview"

export const QuizReport = () => {
    const { id, reportId } = useParams()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')

    const { 
        quizData, 
        averageTime, filteredQuizDetails,
        loading, error
    } = useFetchQuizHistory(reportId ?? '')

    if (!id || !reportId) return null
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading quiz report...</p>
            </div>
        </div>
    )
    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Error: {error.message}</p>
            </div>
        </div>
    )
    if (!quizData) return null

    const accuracyRate = Math.round((quizData.correctAnswers / quizData.cardsStudied) * 100)
    const fastestTime = Math.min(...quizData.quizDetails.map(q => q.timeTaken / 1000))
    // const slowestTime = Math.max(...quizData.quizDetails.map(q => q.timeTaken / 1000)) // Not currently used

    // Calculate review session data
    const totalCards = quizData.cardsStudied
    const cardsToReview = quizData.quizDetails.filter(q => q.cardScore < 5).length
    const learningCards = quizData.quizDetails.filter(q => q.cardScore >= 1 && q.cardScore < 5).length
    const completedCards = quizData.quizDetails.filter(q => q.cardScore >= 5).length
    const estimatedTime = Math.ceil(cardsToReview * 0.5) // Estimate 30 seconds per card

    // Filter quiz details based on search term and selected filter
    const getFilteredDetails = () => {
        let filtered = filteredQuizDetails
        
        // Apply search filter first
        if (searchTerm) {
            filtered = filtered.filter(quiz => 
                quiz.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.userAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        
        // Apply category filter
        switch (filter) {
            case 'correct':
                filtered = filtered.filter(q => q.correct)
                break
            case 'incorrect':
                filtered = filtered.filter(q => !q.correct)
                break
            case 'fastest':
                filtered = filtered.sort((a, b) => a.timeTaken - b.timeTaken)
                break
            case 'slowest':
                filtered = filtered.sort((a, b) => b.timeTaken - a.timeTaken)
                break
            default:
                break
        }
        
        return filtered
    }

    const filteredDetails = getFilteredDetails()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Learning Report</h1>
                            <p className="text-gray-600 mt-1">Review your performance and track your progress</p>
                        </div>
                        <Button 
                            onClick={() => navigate(`/review-page/${id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Review this quiz
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search quiz details"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="correct">Correct</SelectItem>
                                <SelectItem value="incorrect">Incorrect</SelectItem>
                                <SelectItem value="fastest">Fastest</SelectItem>
                                <SelectItem value="slowest">Slowest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Quiz Summary */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Quiz Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Questions</span>
                                <span className="font-semibold text-lg">{quizData.cardsStudied}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Quiz Type</span>
                                <Badge variant="secondary" className="capitalize">{quizData.quizType}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Date</span>
                                <span className="font-medium">{format(new Date(quizData.date), 'MMM dd, yyyy')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Overview */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Accuracy Rate</span>
                                    <span className="font-semibold text-lg">{accuracyRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            accuracyRate >= 80 ? 'bg-green-500' : 
                                            accuracyRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${accuracyRate}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average Time / Question</span>
                                <span className="font-semibold">{averageTime}s</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Fastest Question</span>
                                <span className="font-semibold">{fastestTime.toFixed(1)}s</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Review Session Preview */}
                    <ReviewSessionPreview
                        nextQuizDate={quizData.nextQuizDate}
                        totalCards={totalCards}
                        cardsToReview={cardsToReview}
                        learningCards={learningCards}
                        completedCards={completedCards}
                        averageAccuracy={accuracyRate}
                        estimatedTime={estimatedTime}
                    />
                </div>

                {/* Question Breakdown */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Question Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Question</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Your Answer</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Correct Answer</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time Taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDetails.map((quiz, index) => (
                                        <tr key={quiz._id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">
                                                    Question {index + 1}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {quiz.question}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    {quiz.correct ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className={quiz.correct ? "text-green-700" : "text-red-700"}>
                                                        {quiz.userAnswer}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-gray-900">{quiz.correctAnswer}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {(quiz.timeTaken / 1000).toFixed(1)}s
                                                    </span>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs ${
                                                            getSpeedCategoryClassName(getSpeedCategory(quiz.timeTaken, averageTime))
                                                        }`}
                                                    >
                                                        {getSpeedCategory(quiz.timeTaken, averageTime)}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredDetails.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No questions found matching your criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}