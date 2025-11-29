import { Word } from "@/types"
import { Modal } from "./WordModal"
import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WordCategoryProps {
    title: string;
    words: Word[];
    index?: number;
    isMockData?: boolean;
    isStreaming?: boolean;
    translationKey?: number; // Key that changes only on new translations
}

// Helper function to check if a string is only punctuation
const isPunctuationOnly = (str: string): boolean => {
    // Remove whitespace and check if remaining is only punctuation
    const trimmed = str.trim();
    if (!trimmed) return true;
    // Check if string contains only punctuation characters
    return /^[^\w\s]+$/.test(trimmed);
};

// Helper function to deduplicate words based on Finnish word (fi) and filter out punctuation
const deduplicateWords = (words: Word[]): Word[] => {
    const seen = new Map<string, Word>();
    const seenIds = new Set<string>();
    
    words.forEach(word => {
        const key = word.fi?.toLowerCase().trim() || '';
        // Skip if empty, punctuation only, or already seen
        if (key && !isPunctuationOnly(key)) {
            // If we haven't seen this word before, add it
            if (!seen.has(key)) {
                // Ensure unique ID - if ID already exists, generate a new one
                let uniqueId = word.id || `${word.fi}-${word.en}`;
                let counter = 0;
                while (seenIds.has(uniqueId)) {
                    uniqueId = `${word.fi}-${word.en}-${counter}`;
                    counter++;
                }
                seenIds.add(uniqueId);
                
                seen.set(key, { ...word, id: uniqueId });
            }
        }
    });
    return Array.from(seen.values());
};

const WordCategory: React.FC<WordCategoryProps> = ({ title, words, index = 0, isMockData = false, isStreaming = false, translationKey = 0 }) => {
    const [visibleWords, setVisibleWords] = useState<Word[]>([]);
    const [lastTranslationKey, setLastTranslationKey] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Deduplicate words
    const uniqueWords = useMemo(() => deduplicateWords(words), [words]);
    const MAX_VISIBLE_WORDS = 12; // Show first 12 words, then allow expansion
    const shouldShowExpandButton = uniqueWords.length > MAX_VISIBLE_WORDS;
    
    const displayedWords = useMemo(() => {
        return isExpanded || !shouldShowExpandButton 
            ? uniqueWords 
            : uniqueWords.slice(0, MAX_VISIBLE_WORDS);
    }, [isExpanded, uniqueWords, shouldShowExpandButton]);
    
    useEffect(() => {
        // Only animate when translationKey changes (new translation started)
        if (!isStreaming && uniqueWords.length > 0 && translationKey !== lastTranslationKey) {
            setLastTranslationKey(translationKey);
            setIsExpanded(false); // Reset expansion on new translation
            setVisibleWords([]);
            
            // Calculate what to show initially
            const initialWords = uniqueWords.length > MAX_VISIBLE_WORDS 
                ? uniqueWords.slice(0, MAX_VISIBLE_WORDS)
                : uniqueWords;
            
            // Animate words in with staggered delay for smooth transition
            initialWords.forEach((word, i) => {
                setTimeout(() => {
                    setVisibleWords(prev => [...prev, word]);
                }, i * 50); // Staggered animation: 50ms per word
            });
        } else if (uniqueWords.length === 0) {
            setVisibleWords([]);
        } else if (!isStreaming && uniqueWords.length > 0 && translationKey === lastTranslationKey) {
            // Update visible words when expansion changes or words update
            setVisibleWords(displayedWords);
        }
    }, [uniqueWords, displayedWords, isStreaming, translationKey, lastTranslationKey]);
    
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
            <div className="text-lg font-bold py-2 flex items-center justify-between w-full px-4">
                <div className="flex items-center">
                    {title}
                    {isStreaming && uniqueWords.length === 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                        </span>
                    )}
                    {uniqueWords.length > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                            ({uniqueWords.length})
                        </span>
                    )}
                </div>
                {shouldShowExpandButton && !isStreaming && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        aria-label={isExpanded ? "Show less" : "Show more"}
                    >
                        {isExpanded ? (
                            <>
                                <span>Show less</span>
                                <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                <span>Show {uniqueWords.length - MAX_VISIBLE_WORDS} more</span>
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
            <div className="w-full border-b border-gray-300"></div>
            <div className="flex flex-wrap justify-center p-2 min-h-[60px]">
                {visibleWords.map((word, wordIndex) => {
                    // Create a truly unique key combining multiple fields
                    const uniqueKey = `${word.id || 'no-id'}-${word.fi}-${word.en}-${wordIndex}`;
                    return (
                        <div
                            key={uniqueKey}
                            className="relative animate-fadeInUp"
                            style={{
                                animationDelay: `${wordIndex * 0.05}s`,
                                animationFillMode: 'both',
                                animationDuration: '0.4s'
                            }}
                        >
                            <Modal word={word} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const WordDetails: React.FC<{words: Word[]; highlighted?: boolean; isMockData?: boolean; isStreaming?: boolean; translationKey?: number}> = ({ words, highlighted, isMockData = false, isStreaming = false, translationKey = 0 }) => {
    // Deduplicate words first, then categorize
    const uniqueWords = deduplicateWords(words);
    const categories = [
        { title: 'Verbs', words: uniqueWords.filter(word => word.type === 'verb' )},
        { title: 'Nouns', words: uniqueWords.filter(word => word.type === 'noun' )},
        { title: 'Adjectives', words: uniqueWords.filter(word => word.type === 'adjective') },
        { title: 'Others', words: uniqueWords.filter(word => !["verb", "noun", "adjective"].includes(word.type))}
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
                        translationKey={translationKey}
                    />
                ))}
            </div>
        </div>
    )
}