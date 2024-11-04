import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { useFetchHistory, useFetchNextQuizDate } from "@/state/hooks/useLearningHistoryHooks";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";


export const LearningHistory = ({ deckId }: { deckId: any }) => {
    const userId = localStorage.getItem('userId')
    const { history, fetchHistory } = useFetchHistory(userId, deckId)
    const { nextQuizDate, fetchNextQuizDate } = useFetchNextQuizDate(userId, deckId)
    useEffect(() => {
        if (userId && deckId) {
            fetchHistory()
            fetchNextQuizDate()
        }
    }, [])

    const [expandedGroups, setExpandedGroups] = useState(new Set())

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(groupName)) {
                newSet.delete(groupName)
            } else {
                newSet.add(groupName)
            }
            return newSet
        })
    }

    // Group history items
    type GroupedHistory = Record<string, typeof history[number][]>;

    const groupedHistory = history?.reduce((groups, item) => {
        // Extract base name (e.g., "peach_jay" from "peach_jay_Review01")
        const baseName = item.randomName.split('_Review')[0];
        
        if (!groups[baseName]) {
          groups[baseName] = [];
        }
        groups[baseName].push(item);
        return groups;
      }, {} as GroupedHistory);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {history && history.length > 0 ? (
                        <ul className="space-y-4">
                            {Object.entries(groupedHistory).map(([groupName, items]) => {
                                const isExpanded = expandedGroups.has(groupName)
                                const learningSession = items.find(item => item.quizType === 'learn')
                                const reviewSessions = items.filter(item => item.quizType === 'review')
                                return (
                                    <li key={groupName} className="border rounded-lg p-4">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleGroup(groupName)}
                                        >
                                            <div className="space-y-1">
                                                <div className="font-bold text-blue-500 flex gap-2">
                                                    {learningSession?.randomName}
                                                    <Link to={`/view-decks/${deckId}/learning-report/${learningSession?.id}`} className="underline">[Review]</Link>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                Started: {format(new Date(learningSession!.date), 'dd.MM.yyyy')} • {learningSession!.cardsStudied} cards
                                                </div>
                                            </div>
                                            {reviewSessions.length > 0 && (
                                                <button className="text-gray-500 hover:text-gray-700">
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        {isExpanded && reviewSessions.length > 0 && (
                                            <ul className="mt-3 space-y-2 pl-6"> 
                                                {reviewSessions.map((review) => (
                                                    <li key={review.id} className="border-l-2 border-gray-200 ">
                                                        <Link
                                                        to={`/view-decks/${deckId}/learning-report/${review.id}`}
                                                        className="block hover:bg-gray-50 rounded p-2 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="font-medium">
                                                                    {review.randomName.split(`${groupName}_`)[1]}
                                                                </span>
                                                                <span className="text-sm bg-blue-100 text-blue-800 p-1 rounded">
                                                                    {((review.correctAnswers! / review.cardsStudied) * 100).toFixed(1)}% correct
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                {format(new Date(review.date), 'dd.MM.yyyy')} 
                                                            </div>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <div>There is no learning history for this deck yet.</div>                        
                    )}
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
