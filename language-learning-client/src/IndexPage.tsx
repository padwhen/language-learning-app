import { useEffect, useState } from "react";
import { chatCompletion } from "./ChatCompletion";
import { TranslationBar } from "./components/TranslationBar";
import { InputBar } from "./components/InputBar";
import { Translation } from "./components/Translation";
import { WordDetails } from "./components/Details";
import { User } from "./components/User";
import { DeckInfo } from "./components/DeckInfo";
import { v4 as uuidv4 } from 'uuid';
import jsonData from '../words.json'

export const IndexPage = () => {
    const [fromLanguage, setFromLanguage] = useState<string>('Finnish');
    const [inputText, setInputText] = useState<string>('');
    const [ready, setReady] = useState<boolean>(true)
    const exampleResponse = jsonData
    // const [response, setResponse] = useState<any>(() => {
    //     const storedResponse = localStorage.getItem("response");
    //     return storedResponse ? JSON.parse(storedResponse) : null;
    // });
    const [response, setResponse] = useState<any>(exampleResponse)

    
    const handleTranslation = async () => {
        setReady(false);
        const response_json = await chatCompletion({ language: fromLanguage, text: inputText });
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
            localStorage.setItem("response", JSON.stringify(parsedResponse));
            localStorage.setItem("fromLanguage", fromLanguage)
        }
        setReady(true);
    };

    useEffect(() => {
        return () => {
            localStorage.removeItem("response")
            localStorage.removeItem("fromLanguage")
        };
    }, []);

    return (
        <div className="h-96 flex">
            <div className="mt-8 w-3/4 pt-1 flex flex-col items-center">
                <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                {response?.sentence && (
                    <Translation text={response.sentence} />    
                )}
                {response?.words && (
                    <WordDetails words={response.words} />    
                )}
            </div>
            <div className="w-1/4 pt-1 pr-8 mt-8 flex flex-col">
                <User />
                <div className="pr-0 items-center justify-center">
                    Test username: 0000
                    Test pin: 0000
                </div>
                <div className="mt-5">
                    <DeckInfo />
                </div>
            </div>
        </div>
    )
}
