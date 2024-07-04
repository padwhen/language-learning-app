import { Word } from "@/types"
import { Modal } from "./WordModal"
import React from "react";

interface WordCategoryProps {
    title: string;
    words: Word[]
}

const WordCategory: React.FC<WordCategoryProps> = ({ title, words }) => (
    <div className="w-full border rounded flex flex-col justify-center items-center">
        <div className="text-lg font-bold py-2">{title}</div>
        <div className="w-full border-b border-gray-300"></div>
        <div className="flex flex-wrap justify-center p-2">
            {words.map((word, index) => (
                <Modal key={index} word={word} />
            ))}
        </div>
    </div>
)

export const WordDetails: React.FC<{words: Word[]}> = ({ words }) => {
    const categories = [
        { title: 'Verbs', words: words.filter(word => word.type === 'verb' )},
        { title: 'Nouns', words: words.filter(word => word.type === 'noun' )},
        { title: 'Adjectives', words: words.filter(word => word.type === 'adjective') },
        { title: 'Others', words: words.filter(word => !["verb", "noun", "adjective"].includes(word.type))}
    ]
    return (
        <div className="mt-5 w-full max-w-4xl px-4 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                    <WordCategory key={index} title={category.title} words={category.words} />
                ))}
            </div>
        </div>
    )
}