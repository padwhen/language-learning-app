export type LearningStep = 'intro' | 'settings' | 'preview' | 'quiz' | 'resume-review' | 'complete'

export interface SavedProgress {
    currentQuestion: number;
    answers: any[]
    score: number
}

export type CardTypeToLearn = 'All' | 'Completed' | 'Not studied' | 'Learning' | 'Due for Review'

export interface QuizSettingsType {
    includeCompleteCards: boolean;
    cardsToLearn: number;
    cardTypeToLearn: CardTypeToLearn;
    shuffleCards: boolean
}