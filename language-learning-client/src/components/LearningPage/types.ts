export type LearnignStep = 'intro' | 'settings' | 'preview' | 'quiz' | 'complete'

export interface SavedProgress {
    currentQuestion: number;
    answers: any[]
    score: number
}