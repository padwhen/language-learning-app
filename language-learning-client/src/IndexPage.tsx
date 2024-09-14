import { TranslationBar } from "./components/IndexPage/TranslationBar";
import { InputBar } from "./components/IndexPage/InputBar";
import { Translation } from "./components/IndexPage/Translation";
import { WordDetails } from "./components/IndexPage/Details";
import { User } from "./components/IndexPage/User";
import { DeckInfo } from "./components/IndexPage/DeckInfo";
import useTranslation from "./state/hooks/useTranslation";


export const IndexPage = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation } = useTranslation()

    return (
        <div className="flex flex-col lg:flex-row">
            <div className="w-full px-4 lg:px-16 flex flex-col items-center">
                <TranslationBar fromLanguage={fromLanguage} setFromLanguage={setFromLanguage} />
                <InputBar inputText={inputText} setInputText={setInputText} handleTranslation={handleTranslation} ready={ready} />
                {response?.sentence && (
                    <Translation text={response.sentence} />    
                )}
                {response?.words && (
                    <WordDetails words={response.words} />    
                )}
            </div>
            <div className="w-full lg:w-1/4 flex flex-col mr-4">
                <div className="md:hidden lg:hidden"><User /></div>
                <div className="mt-2">
                    <DeckInfo />
                </div>
            </div>
        </div>
    )
}
