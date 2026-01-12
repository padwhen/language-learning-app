import { createContext, useContext, useState, ReactNode } from 'react';

interface TranslationHoverContextType {
    hoveredText: string | null; // English text for translation highlighting
    hoveredOriginalText: string | null; // Finnish/original text for original sentence highlighting
    hoveredFlashcardFi: string | null; // Finnish word from original text that should highlight its flashcard
    setHoveredText: (text: string | null) => void;
    setHoveredOriginalText: (text: string | null) => void;
    setHoveredFlashcardFi: (text: string | null) => void;
}

const TranslationHoverContext = createContext<TranslationHoverContextType | undefined>(undefined);

export const TranslationHoverProvider = ({ children }: { children: ReactNode }) => {
    const [hoveredText, setHoveredText] = useState<string | null>(null);
    const [hoveredOriginalText, setHoveredOriginalText] = useState<string | null>(null);
    const [hoveredFlashcardFi, setHoveredFlashcardFi] = useState<string | null>(null);

    return (
        <TranslationHoverContext.Provider value={{ hoveredText, hoveredOriginalText, hoveredFlashcardFi, setHoveredText, setHoveredOriginalText, setHoveredFlashcardFi }}>
            {children}
        </TranslationHoverContext.Provider>
    );
};

export const useTranslationHover = () => {
    const context = useContext(TranslationHoverContext);
    if (context === undefined) {
        throw new Error('useTranslationHover must be used within a TranslationHoverProvider');
    }
    return context;
};

