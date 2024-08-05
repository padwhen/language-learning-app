import { useState } from "react"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { format } from "date-fns";
import { useParams } from "react-router-dom"
import { useFetchQuizHistory } from "@/state/hooks/useFetchQuizHistory"
import { QuizDetailsCard } from "./QuizDetailsCard"
import { NextQuizCard } from "./NextQuizCard"

export const QuizReport = () => {
    const { id } = useParams()
    if (!id) return

    const { 
        quizData, 
        searchTerm, setSearchTerm,
        setFilter,
        averageTime, filteredQuizDetails,
        loading, error
    } = useFetchQuizHistory(id)

    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!quizData) return

    console.log(quizData)

    return (
        <div className="container p-4 shadow-lg rounded-lg space-y-2 sm:space-y-0 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center ">
                <h1 className="text-4xl font-bold text-gray-700">Quiz [{quizData.randomName}] Report</h1>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                    <Input size={40} placeholder="Search Terms" value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-auto" />
                    <Select onValueChange={setFilter} defaultValue="default">
                        <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="correct">Correct</SelectItem>
                            <SelectItem value="incorrect">Incorrect</SelectItem>
                            <SelectItem value="fastest">Fastest</SelectItem>
                            <SelectItem value="slowest">Slowest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="py-4">
                <p className="text-lg font-semibold text-blue-500">🎯 {quizData.correctAnswers} out of {quizData.cardsStudied} ({((quizData.correctAnswers) / quizData.cardsStudied * 100).toFixed(0)}%) correct 🪅</p>
                <p className="font-semibold">🕐 Average Time Taken: {averageTime}s a question 🕐</p>
                <p className="font-sembibold text-lg">📪 Taken date: {format(new Date(quizData.date), 'dd.MM.yyyy \'at\' HH.mm')}</p>
            </div>

            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <QuizDetailsCard
                    filteredQuizDetails={filteredQuizDetails}
                    averageTime={averageTime}
                    hoveredCard={hoveredCard}
                    setHoveredCard={setHoveredCard}
                />
                <NextQuizCard quizData={quizData} averageTime={averageTime} />
            </div>
        </div>
    )
}