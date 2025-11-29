import { createContext, useContext, useState, ReactNode } from 'react';

interface TranslationHoverContextType {
    hoveredText: string | null;
    setHoveredText: (text: string | null) => void;
}

const TranslationHoverContext = createContext<TranslationHoverContextType | undefined>(undefined);

export const TranslationHoverProvider = ({ children }: { children: ReactNode }) => {
    const [hoveredText, setHoveredText] = useState<string | null>(null);

    return (
        <TranslationHoverContext.Provider value={{ hoveredText, setHoveredText }}>
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

