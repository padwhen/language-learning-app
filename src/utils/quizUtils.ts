import { QuizDetail } from "@/types";

export const getUniqueQuizDetails = (
    quizDetails: QuizDetail[],
    filterFunction: (q: QuizDetail) => boolean
): string => {
    const uniqueQuestions = new Set<string>()
    return quizDetails
        .filter(filterFunction)
        .filter(quiz => {
            if (uniqueQuestions.has(quiz.question)) {
                return false
            }
            uniqueQuestions.add(quiz.question)
            return true
        })
        .map(q => q.question)
        .join(', ') || 'Nothing'
}

export const getSpeedCategory = (timeTaken: number, averageTime: any): string => {
    const avgTime = parseFloat(averageTime) * 1000
    if (timeTaken <= avgTime / 1.5) return "Fast"
    if (timeTaken <= avgTime) return "Average"
    return "Slow"
}

export const getSpeedCategoryClassName = (speedCategory: string) => {
    switch (speedCategory) {
        case 'Fast':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'Average':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'Slow':
            return 'bg-gray-100 text-gray-600 border-gray-200'
        default:
            return 'bg-gray-100 text-gray-600 border-gray-200'
    }
}