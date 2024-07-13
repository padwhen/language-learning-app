import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { useFetchHistory, useFetchNextQuizDate } from "@/state/hooks/useLearningHistoryHooks";

const LearningHistory = ({ deckId }: { deckId: any }) => {
    const userId = localStorage.getItem('userId')
    const { history, fetchHistory } = useFetchHistory(userId, deckId)
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, deckId)
    useEffect(() => {
        if (userId && deckId) {
            fetchHistory()
            fetchNextQuizDate()
        }
    }, [])

    console.log(history)

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
                                    <span className="font-bold">{item.randomName} {format(new Date(item.date), 'dd.MM.yyyy')}</span>: {item.quizType === 'learn' ? 'Learned' : 'Reviewed'} {item.correctAnswers} out of {item.cardsStudied} cards. 
                                </li>
                            ))}
                        </ul>
                    : (<div>
                        There is no learning history for this deck yet.
                    </div>)}
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