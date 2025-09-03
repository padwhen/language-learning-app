import { Word } from "@/types"
import { Modal } from "./WordModal"
import React, { useEffect, useState } from "react";

interface WordCategoryProps {
    title: string;
    words: Word[];
    index?: number;
    isMockData?: boolean;
    isStreaming?: boolean;
}

const WordCategory: React.FC<WordCategoryProps> = ({ title, words, index = 0, isMockData = false, isStreaming = false }) => {
    const [visibleWords, setVisibleWords] = useState<Word[]>([]);
    
    useEffect(() => {        
        if (!isStreaming) {
            setVisibleWords(words);
            return;
        }
        
        // When streaming, animate in new words immediately
        if (words.length > visibleWords.length) {
            const newWords = words.slice(visibleWords.length);
            
            newWords.forEach((word, i) => {
                setTimeout(() => {
                    setVisibleWords(prev => {
                        // Replace existing partial with complete if available
                        const existing = prev.findIndex(w => w.fi === word.fi && w.en === word.en);
                        if (existing !== -1) {
                            const updated = [...prev];
                            updated[existing] = word;
                            return updated;
                        }
                        return [...prev, word];
                    });
                }, i * 100); // Faster animation for immediate feedback
            });
        } else if (words.length === visibleWords.length) {
            // Update existing words (partial -> complete)
            const hasChanges = words.some((word, i) => {
                const visible = visibleWords[i];
                return visible && (
                    (visible as any).isPartial && !(word as any).isPartial
                );
            });
            
            if (hasChanges) {
                setVisibleWords(words);
            }
        }
    }, [words, isStreaming]);
    
    // Reset visible words when words array changes completely (new translation)
    useEffect(() => {
        if (!isStreaming) {
            setVisibleWords(words);
        } else {
            setVisibleWords([]);
        }
    }, [words.length === 0]); // Reset when starting new translation
    
    return (
        <div 
            className={`w-full border rounded flex flex-col justify-center items-center ${
                isMockData ? 'animate-fadeIn' : ''
            }`}
            style={isMockData ? { 
                animationDelay: `${0.1 + (index * 0.1)}s`,
                animationFillMode: 'both'
            } : {}}
        >
            <div className="text-lg font-bold py-2">
                {title}
                {isStreaming && visibleWords.length === 0 && words.length === 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                    </span>
                )}
                {visibleWords.length > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                        ({visibleWords.length})
                    </span>
                )}
            </div>
            <div className="w-full border-b border-gray-300"></div>
            <div className="flex flex-wrap justify-center p-2 min-h-[60px]">
                {visibleWords.map((word, wordIndex) => (
                    <div
                        key={word.id || `${word.fi}-${word.en}`}
                        className={`relative ${isStreaming ? 'animate-slideIn' : ''}`}
                        style={isStreaming ? {
                            animationDelay: `${wordIndex * 0.05}s`,
                            animationFillMode: 'both'
                        } : {}}
                    >
                        <Modal word={word} />
                        {/* Show loading indicator for partial words */}
                        {(word as any).isPartial && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-3 h-3 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-2 w-2 border-[1px] border-white border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                ))}
                {isStreaming && words.length > visibleWords.length && (
                    <div className="flex items-center justify-center p-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-xs text-gray-500">Loading more...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const WordDetails: React.FC<{words: Word[]; highlighted?: boolean; isMockData?: boolean; isStreaming?: boolean}> = ({ words, highlighted, isMockData = false, isStreaming = false }) => {
    const categories = [
        { title: 'Verbs', words: words.filter(word => word.type === 'verb' )},
        { title: 'Nouns', words: words.filter(word => word.type === 'noun' )},
        { title: 'Adjectives', words: words.filter(word => word.type === 'adjective') },
        { title: 'Others', words: words.filter(word => !["verb", "noun", "adjective"].includes(word.type))}
    ]
    return (
        <div className={`mt-5 w-full px-0 mx-auto transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                    <WordCategory 
                        key={index} 
                        title={category.title} 
                        words={category.words} 
                        index={index}
                        isMockData={isMockData}
                        isStreaming={isStreaming}
                    />
                ))}
            </div>
        </div>
    )
}