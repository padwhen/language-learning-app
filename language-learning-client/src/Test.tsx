import { useMemo, useState } from "react"
import { Input } from "./components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import mockdata from './mockdata.json'
import { Card, CardContent } from "./components/ui/card"
import { format } from "date-fns";
import { Button } from "./components/ui/button"

export const QuizReport = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('default')

    const averageTime = useMemo(() => {
        const totalTime = mockdata.quizDetails.reduce((sum, quiz) => sum + quiz.timeTaken, 0)
        return (totalTime / mockdata.quizDetails.length / 1000).toFixed(2)
    }, [])

    const getSpeedCategory = (timeTaken: number): string => {
        const avgTime = parseFloat(averageTime) * 1000
        if (timeTaken <= avgTime / 1.5) return "Fastest"
        if (timeTaken <= avgTime) return "Average"
        return "Slow"
    }

    const getSpeedCategoryClassName = (speedCategory: string) => {
        switch (speedCategory) {
            case 'Fastest':
                return 'animate-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-black text-xl p-2'
            case 'Average':
                return 'text-black font-bold p-2'
            case 'Slow':
                return 'bg-gradient-to-r from-blue-200 to-blue-500 text-blue-800 font-semibold bg-clip-text text-transparent p-2'
            default:
                return ''
        }
    }

    const filteredQuizDetails = useMemo(() => {
        return mockdata.quizDetails.filter(quiz => 
            quiz.question.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [])


    return (
        <div className="container p-4 shadow-lg rounded-lg mx-4 space-y-2 sm:space-y-0 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center ">
                <h1 className="text-4xl font-bold text-gray-700">Quiz [{mockdata.randomName}] Report</h1>
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
                <p className="text-lg font-semibold text-blue-500">🎯 {mockdata.correctAnswers} out of {mockdata.cardsStudied} ({(mockdata.correctAnswers / mockdata.cardsStudied * 100).toFixed(0)}%) correct 🪅</p>
                <p className="font-semibold">🕐 Average Time Taken: {averageTime}s a question 🕐</p>
                <p className="font-sembibold text-lg">📪 Taken date: {format(new Date(mockdata.date), 'dd.MM.yyyy \'at\' HH.mm')}</p>
            </div>

            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <Card className="w-full lg:w-2/3 max-h-[500px] overflow-y-auto border-none shadow-none">
                    <CardContent>
                        <h2 className="text-3xl font-bold my-2 bg-gradient-to-r from-indigo-400 via-violet-600 to-cyan-400 bg-clip-text text-transparent">
                            Correct
                        </h2>
                        {filteredQuizDetails.filter(quiz => quiz.correct).map((quiz) => (
                            <div key={quiz._id} className="mb-2 p-2 border rounded-lg">
                                <div className="flex justify-between flex-wrap">
                                    <span className="font-bold p-2 text-xl">{quiz.question}</span>
                                    <span className={getSpeedCategoryClassName(getSpeedCategory(quiz.timeTaken))}>
                                        {getSpeedCategory(quiz.timeTaken)}
                                    </span>
                                </div>
                                <p className="flex gap-2 p-2">
                                    <h1 className="text-blue-700">Your Choice/Correct Answer: </h1>{quiz.correctAnswer}
                                </p>
                            </div>
                        ))}
                        <h2 className="text-3xl font-bold my-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                            Incorrect
                        </h2>
                        {filteredQuizDetails.filter(quiz => !quiz.correct).map((quiz) => (
                            <div key={quiz._id} className="mb-2 p-2 border rounded">
                                <div className="flex justify-between flex-wrap">
                                    <span className="font-bold p-2 text-xl">{quiz.question}</span>
                                    <span className={getSpeedCategoryClassName(getSpeedCategory(quiz.timeTaken))}>
                                        {getSpeedCategory(quiz.timeTaken)}
                                    </span>
                                </div>
                                <p className="p-2 flex gap-2">
                                    <h1 className="text-blue-700">Your Choice: </h1>{quiz.userAnswer}
                                    <h1 className="text-blue-700">Correct Answer: </h1>
                                    <span className={`ml-2 ${hoveredCard === quiz._id ? '' : 'blur-sm'}`} onMouseEnter={() => setHoveredCard(quiz._id)} onMouseLeave={() => setHoveredCard(null)}>
                                        {quiz.correctAnswer}
                                    </span>

                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="w-full lg:w-1/3">
                <Card>
                    <CardContent>
                        <h2 className="text-2xl font-bold p-2 mt-2">Next Quiz {format(new Date(mockdata.nextQuizDate), 'dd.MM.yyyy')}</h2>
                        <h3 className="font-bold text-blue-600 p-2 text-xl">High Priority</h3>
                        <span className="flex gap-2 flex-row p-2">
                            <p className="font-bold text-red-700">Incorrect Quiz: </p>
                            <p>{mockdata.quizDetails.filter(q => !q.correct).map(q => q.question).join(', ') || 'Nothing'}</p>
                        </span>
                        <span className="flex gap-2 flex-row p-2">
                            <p className="font-bold text-red-700">Correct But Slow: </p>
                            <p>{mockdata.quizDetails.filter(q => q.correct && q.timeTaken > parseFloat(averageTime) * 1000).map(q => q.question).join(', ') || 'Nothing'}</p>
                        </span>
                        <span className="flex gap-2 flex-row p-2">
                            <p className="font-bold text-red-700">Not Studied / Ongoing Cards: </p>
                            <p>{mockdata.quizDetails.filter(q => q.cardScore <= 2).map(q => q.question).join(', ') || 'Nothing'}</p>
                        </span>
                        <h3 className="font-bold text-blue-600 p-2 text-xl">Review Again</h3>
                        <span className="flex gap-2 flex-row p-2">
                            <p className="font-bold text-blue-700">Terms: </p>
                            <p>{mockdata.quizDetails.filter(q => q.cardScore <= 4 && q.cardScore > 2 && q.correct).map(q => q.question).join(', ') || 'Nothing'}</p>
                        </span>
                        <h3 className="font-bold text-blue-600 p-2 text-xl">Completed</h3>
                        <span className="flex gap-2 flex-row p-2">
                            <p className="font-bold text-blue-700">Terms: </p>
                            <p>{mockdata.quizDetails.filter(q => q.cardScore == 5 && q.correct).map(q => q.question).join(', ') || 'Nothing'}</p>
                        </span>
                        <Button className="mt-4 w-full">
                            Review this quiz now.
                        </Button>
                    </CardContent>
                </Card>

                </div>
            </div>
        </div>
    )
}