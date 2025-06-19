import { Word } from "@/types"
import { Modal } from "./WordModal"
import React from "react";

interface WordCategoryProps {
    title: string;
    words: Word[];
    index?: number;
    isMockData?: boolean;
}

const WordCategory: React.FC<WordCategoryProps> = ({ title, words, index = 0, isMockData = false }) => (
    <div 
        className={`w-full border rounded flex flex-col justify-center items-center ${
            isMockData ? 'animate-in fade-in slide-in-from-bottom-4' : ''
        }`}
        style={isMockData ? { 
            animationDelay: `${0.1 + (index * 0.1)}s`,
            animationDuration: '0.5s',
            animationFillMode: 'both'
        } : {}}
    >
        <div className="text-lg font-bold py-2">{title}</div>
        <div className="w-full border-b border-gray-300"></div>
        <div className="flex flex-wrap justify-center p-2">
            {words.map((word, index) => (
                <Modal key={index} word={word} />
            ))}
        </div>
    </div>
)

export const WordDetails: React.FC<{words: Word[]; highlighted?: boolean; isMockData?: boolean}> = ({ words, highlighted, isMockData = false }) => {
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
                    />
                ))}
            </div>
        </div>
    )
}