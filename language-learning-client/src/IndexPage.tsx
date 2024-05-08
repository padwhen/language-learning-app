import { useState } from "react";
import jsonData from '../words.json'
import { chatCompletion } from "./ChatCompletion";
import { TranslationBar } from "./components/TranslationBar";
import { InputBar } from "./components/InputBar";
import { Translation } from "./components/Translation";
import { WordDetails } from "./components/Details";
import { User } from "./components/User";
import { DeckInfo } from "./components/DeckInfo";
import { v4 as uuidv4 } from 'uuid';

export const IndexPage = () => {
    const [fromLanguage, setFromLanguage] = useState<string>('Finnish');
    const [inputText, setInputText] = useState<string>('');
    const [ready, setReady] = useState<boolean>(true)
    const exampleResponse = jsonData
    const [response, setResponse] = useState<any>(exampleResponse)
    const handleTranslation = async () => {
        setReady(false);
        const response_json = await chatCompletion({ language: fromLanguage, text: inputText });
        console.log(response_json)
        if (response_json !== null) {
            const parsedResponse = JSON.parse(response_json);
            const { sentence, words } = parsedResponse
            if (sentence) {
                setResponse((prevResponse: any) => ({
                    ...prevResponse,
                    sentence: sentence
                }))
            }
            if (words) {
                const wordsWithUUID = words.map((word: any) => ({
                    ...word, id: uuidv4()
                }));
                setResponse((prevResponse: any) => ({
                    ...prevResponse, words: wordsWithUUID
                }));
            }
        }
        setReady(true);
    };    
    console.log(response)
    return (
        <div className="h-96 flex">
            <div className="mt-8 w-3/4 pt-1 flex flex-col items-center">
                <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                {response.sentence && response.sentence && (
                    <Translation text={response.sentence} />    
                )}
                {response.words && response.words && (
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