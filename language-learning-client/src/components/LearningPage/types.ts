export type LearningStep = 'intro' | 'settings' | 'preview' | 'quiz' | 'complete'

export interface SavedProgress {
    currentQuestion: number;
    answers: any[]
    score: number
}

export type CardTypeToLearn = 'All' | 'Completed' | 'Not studied' | 'Learning'