import { Modal } from "./Modal"

export const WordDetails = () => {
    return (
        <div className="grid grid-cols-2 gap-4 mt-5 w-full">
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[110px]">
                <div className="text-lg font-bold">Verbs</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    <Modal text='Hello' />
                    <Modal text='a-really-long-word' />
                    <Modal text='herkullinen' />
                    <Modal text='tervetuloaa' /> 
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[28px]">
                <div className="text-lg font-bold">Adjectives</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center mt-1">
                    <Modal text='Hello' />
                    <Modal text='a-really-long-word' />
                    <Modal text='herkullinen' />
                    <Modal text='tervetuloaa' /> 
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[110px]">
                <div className="text-lg font-bold">Nouns</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    <Modal text='Hello' />
                    <Modal text='a-really-long-word' />
                    <Modal text='herkullinen' />
                    <Modal text='tervetuloaa' /> 
                </div>
            </div>
            <div className="w-96 border rounded flex flex-col justify-center items-center ml-[28px]">
                <div className="text-lg font-bold">Adverbs / Prepositions</div>
                <div className="w-full border-b border-gray-300"></div>
                <div className="flex flex-wrap justify-center">
                    <Modal text='Hello' />
                    <Modal text='a-really-long-word' />
                    <Modal text='herkullinen' />
                    <Modal text='tervetuloaa' /> 
                </div>
            </div>
        </div>
    )
}
