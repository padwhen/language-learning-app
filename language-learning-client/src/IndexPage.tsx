import { TranslationBar } from "./components/TranslationBar";
import { InputBar } from "./components/InputBar";
import { Translation } from "./components/Translation";
import { WordDetails } from "./components/Details";
import { User } from "./components/User";
import { DeckInfo } from "./components/DeckInfo";
import useTranslation from "./state/hooks/useTranslation";


export const IndexPage = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation } = useTranslation()

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
