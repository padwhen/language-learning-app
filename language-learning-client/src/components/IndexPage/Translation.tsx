import React from 'react';
import { Word } from '@/types';
import { hasGrammaticalContext } from '@/utils/grammarUtils';
import { Modal } from './WordModal';

interface TranslationProps {
    text: string;
    highlighted?: boolean;
    words?: Word[];
    learningMode?: boolean;
}

export const Translation: React.FC<TranslationProps> = ({ 
    text, 
    highlighted, 
    words = [], 
    learningMode = false 
}) => {
    // If learning mode is off or no words data, show plain text
    if (!learningMode || !words || words.length === 0) {
        return (
            <div className={`mt-8 w-full px-0 mx-auto transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}>
                <blockquote className="relative">
                    <div className="relative z-10">
                        <p className="text-gray-800">
                            <em className="text-lg sm:text-xl md:text-2xl" data-testid="translation-result">{text}</em>
                        </p>
                    </div>
                </blockquote>
            </div>
        );
    }



    return (
        <div className={`mt-8 w-full px-0 mx-auto transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}>
            <blockquote className="relative">
                <div className="relative z-10">
                    <p className="text-gray-800">
                        <em className="text-lg sm:text-xl md:text-2xl leading-relaxed" data-testid="translation-result">
                            {text}
                        </em>
                    </p>
                </div>
            </blockquote>
        </div>
    );
};
