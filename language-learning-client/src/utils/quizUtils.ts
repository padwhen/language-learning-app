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
    const avgTime =  parseFloat(averageTime) * 1000
    if (timeTaken <= avgTime / 1.5) return "Fastest"
    if (timeTaken <= avgTime) return "Average"
    return "Slow"
}

export const getSpeedCategoryClassName = (speedCategory: string) => {
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