import { Word } from "@/types"
import { Modal } from "./Modal"

export const WordDetails: React.FC<{words: Word[]}> = ({ words }) => {
    const verbs = words.filter(word => word.type === 'verb')
    const nouns = words.filter(word => word.type === 'noun')
    const adjectives = words.filter(word => word.type === 'adjective')
    const others = words.filter(word => !['verb', 'noun', 'adjective'].includes(word.type)) 
    return (
        <div className="grid grid-cols-2 gap-4 mt-5 w-full">
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[110px]">
                <div className="text-lg font-bold">Verbs</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    {verbs.map((word, index) => (
                        <Modal key={index} word={word} />
                    ))}
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[28px]">
                <div className="text-lg font-bold">Nouns</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    {nouns.map((word, index) => (
                        <Modal key={index} word={word} />
                    ))}
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[110px]">
                <div className="text-lg font-bold">Adjectives</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    {adjectives.map((word, index) => (
                        <Modal key={index} word={word} />
                    ))}
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[28px]">
                <div className="text-lg font-bold">Others</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    {others.map((word, index) => (
                        <Modal key={index} word={word} />
                    ))}
                </div>
            </div>
        </div>
    )
}