import { WordDetails } from "./components/Details"
import { InputBar } from "./components/InputBar"
import { TranslationBar } from "./components/TranslationBar"
import { Translation } from "./components/Translation"
import { User } from "./components/User"
import { DeckInfo } from "./components/DeckInfo"
import { useState } from "react"
import { chatCompletion } from "./Test"
import jsonData from '../words.json'

export const IndexPage = () => {
    const [fromLanguage, setFromLanguage] = useState('Finnish');
    const [inputText, setInputText] = useState('');
    const [ready, setReady] = useState(true)
    const [forceUpdate, setForceUpdate] = useState(false)
    const exampleResponse = jsonData
    const [response, setResponse] = useState(exampleResponse)
    console.log(response)
    const handleTranslation = async () => {
        setReady(false)
        const response = await chatCompletion({ language: fromLanguage, text: inputText });
        setResponse(JSON.parse(response))
        setReady(true)
        setForceUpdate(prev => !prev)
    };
    return (
        <div>
            <div className="h-96 flex">
                <div className="mt-8 w-3/4 pt-1 flex flex-col items-center">
                    <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                    <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                    <Translation text={response.sentence} />
                    <WordDetails words={response.words} forceUpdate={forceUpdate} />
                </div>
                <div className="w-1/4 pt-1 pr-8 mt-8 flex flex-col ">
                    <User />
                    <div className="mt-5">
                        <DeckInfo />                        
                        <DeckInfo />                                        
                    </div>
                </div>
            </div>
        </div>
    )
}