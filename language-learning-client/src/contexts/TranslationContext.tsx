import React, { createContext, useContext, ReactNode } from 'react';
import useTranslation from '@/state/hooks/useTranslation';

interface TranslationContextType {
  fromLanguage: string;
  setFromLanguage: (language: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  ready: boolean;
  isStreaming: boolean;
  currentWordIndex: number;
  validationError: string | null;
  learningMode: boolean;
  setLearningMode: (mode: boolean) => void;
  learningModeStep: number;
  showLearningWidget: boolean;
  closeWidget: () => void;
  isTranslationCompleted: boolean;
  handleTranslationComplete: () => void;
  response: any;
  handleTranslation: () => Promise<void>;
  handleTranslationStream: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationContextProviderProps {
  children: ReactNode;
}

export const TranslationContextProvider: React.FC<TranslationContextProviderProps> = ({ children }) => {
  const translationHook = useTranslation();

  return (
    <TranslationContext.Provider value={translationHook}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationContextProvider');
  }
  return context;
};
