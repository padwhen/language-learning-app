export interface Word {
    fi: string;
    en: string;
    type: string;
    original_word: string;
    pronunciation: string;
    comment: string;
}

export interface DockCardData {
    name: string;
    completePercentage: number;
    flashcardsCount: number;
    badgeWords: string[];
}

export interface FormData {
    name: string;
    username: string;
    pin: string;
}
