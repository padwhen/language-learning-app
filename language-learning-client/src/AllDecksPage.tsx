import { DockCardLarge } from "./components/DockCardLarge"
import { Button } from "./components/ui/button"

export const AllDecks = () => {
    return (
        <div className="pt-[30px] ml-5">
            <header className="flex justify-between items-center">
                <div className="flex gap-1 items-center border border-gray-300 rounded-md px-3 py-1 bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <span className="text-gray-700">Back to translate page</span>
                </div>
            </header>
            <div className="flex items-center justify-center pr-[50px]">
                    <h1 className="text-4xl font-bold text-gray-900">[username] all decks</h1>
            </div>
            <div className="pt-[50px]">
                <div className="flex gap-1 items-center">
                    <Button size="lg" variant="secondary" className="text-2xl hover:scale-110 hover:ring ring-gray-500 ring-opacity-50">
                        Recent
                    </Button>
                </div>
                <div className="flex flex-row gap-5 flex-row-3 justify-center items-center mt-5">
                    <DockCardLarge />
                    <DockCardLarge />
                    <DockCardLarge />
                </div>
            </div>
            <div className="pt-[50px]">
                <div className="flex gap-1 items-center">
                    <Button size="lg" variant="secondary" className="text-2xl hover:scale-110 hover:ring ring-gray-500 ring-opacity-50">
                        Popular decks in Finnish
                    </Button>
                </div>
                <div className="flex flex-row gap-5 flex-row-3 justify-center items-center mt-5">
                    <DockCardLarge />
                    <DockCardLarge />
                    <DockCardLarge />
                </div>
            </div>
        </div>
    )
}
