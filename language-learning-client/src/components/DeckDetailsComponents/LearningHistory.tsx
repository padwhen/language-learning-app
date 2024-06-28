import axios from "axios";
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

interface HistoryItem {
    date: string;
    cardsStudied: number;
    quizType: 'learn' | 'review'
}

const LearningHistory = ({ deckId }: { deckId: any }) => {
    const userId = localStorage.getItem('userId')
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [nextQuizDate, setNextQuizDate] = useState<Date | null>(null)
    console.log(nextQuizDate)

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`/learning-history/${userId}/${deckId}`)
            setHistory(response.data.history)
        } catch (error) {
            console.error('Error fetching learning history: ', error)
        }
    }
    const fetchNextQuizDate = async () => {
        try {
            const response = await axios.get(`/learning-history/next-quiz-date/${userId}/${deckId}`)
            setNextQuizDate(new Date(response.data.nextQuizDate))
        } catch (error) {
            console.error('Error fetching next quiz date: ', error)
        }
    }

    useEffect(() => {
        fetchHistory()
        fetchNextQuizDate()
    }, [])
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {history && history.length > 0 ? 
                        <ul className="space-y-2">
                            {history.map((item, index) => (
                                <li key={index}>
                                    <span className="font-bold">{format(new Date(item.date), 'dd.MM.yyyy')}</span>: {item.quizType === 'learn' ? 'Learned' : 'Reviewed'} {item.cardsStudied} cards
                                </li>
                            ))}
                        </ul>
                    : <div>
                        There is no learning history for this deck yet.
                    </div>
                    }
                </CardContent>
            </Card>
            {nextQuizDate && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Next Quiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar mode="single" selected={nextQuizDate} className="rounded-md border" />
                        <p className="mt-2 text-center">
                            Next quiz scheduled for: {format(nextQuizDate, 'dd.MM.yyyy (EEEE)')}
                        </p>
                    </CardContent>
                </Card>                
            )}
        </>
    )
}

export default LearningHistory