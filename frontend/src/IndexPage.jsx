import { WordDetails } from "./components/Details"
import { InputBar } from "./components/InputBar"
import { TranslationBar } from "./components/TranslationBar"
import { Translation } from "./components/Translation"
import { User } from "./components/User"
import { DeckInfo } from "./components/DeckInfo"

export const IndexPage = () => {
    return (
        <div>
            <div className="h-96 flex">
                <div className="mt-8 w-3/4 pt-1 flex flex-col items-center">
                    <TranslationBar />
                    <InputBar />
                    <Translation />
                    <WordDetails />
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