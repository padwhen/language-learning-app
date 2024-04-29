import { useState } from "react";
import jsonData from '../words.json'
import { chatCompletion } from "./ChatCompletion";
import { TranslationBar } from "./components/TranslationBar";
import { InputBar } from "./components/InputBar";
import { Translation } from "./components/Translation";
import { WordDetails } from "./components/Details";
import { User } from "./components/User";
import { DeckInfo } from "./components/DeckInfo";

export const IndexPage = () => {
    const [fromLanguage, setFromLanguage] = useState<string>('Finnish');
    const [inputText, setInputText] = useState<string>('');
    const [ready, setReady] = useState<boolean>(true)
    const exampleResponse = jsonData
    const [response, setResponse] = useState<any>(exampleResponse)
    const handleTranslation = async () => {
        setReady(false)
        const response_json = await chatCompletion({ language: fromLanguage, text: inputText })
        if (response_json !== null) {
            setResponse(JSON.parse(response_json))
        }
        setReady(true) 
    }
    return (
        <div className="h-96 flex">
            <div className="mt-8 w-3/4 pt-1 flex flex-col items-center">
                <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                {response && response.sentence && (
                    <Translation text={response.sentence} />    
                )}
                {response && response.words && (
                    <WordDetails words={response.words} />    
                )}
            </div>
            <div className="w-1/4 pt-1 pr-8 mt-8 flex flex-col">
                <User />
                <div className="mt-5">
                    <DeckInfo />
                    <DeckInfo />
                </div>
            </div>
        </div>
    )
}