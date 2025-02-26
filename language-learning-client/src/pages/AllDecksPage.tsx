import { Link } from "react-router-dom"
import { DockCardLarge } from "../components/AllDeckPagesComponents/DockCardLarge"
import { useContext, useState} from "react";
import { UserContext } from "../UserContext";
import { DeckContext } from "../DeckContext";
import { sortAndFilterDecks } from "../utils/sortAndFilterDecks";
import { SortableSelect } from "@/components/AllDeckPagesComponents/SortableSelect";

export const AllDecks = () => {
    const { user } = useContext(UserContext);
    const { decks } = useContext(DeckContext)

    const [sortBy, setSortBy] = useState('Most cards')
   
    const { allLanguages, displayedDecks } = sortAndFilterDecks(decks, sortBy, false)

    return (
        <div className="pt-4 md:pt-[30px] px-4 md:px-5 md:mx-32">
            <div className="flex sm:flex-row items-center justify-center mb-6 text-2xl md:text-4xl font-bold">
                <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-transparent bg-clip-text">
                    @{user?.name || user?.username}
                </h1>
                <h1 className="text-gray-900 ml-2">all decks</h1>
            </div>
            {displayedDecks.length > 0 && (
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                        <div className="w-full sm:w-auto ml-auto">
                            <SortableSelect sortBy={sortBy} setSortBy={setSortBy} allLanguages={allLanguages} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 justify-center items-stretch">
                    {displayedDecks.map((deck: any) => (
                        <Link key={deck._id} to={`/view-decks/${deck._id}`} className="flex">
                            <DockCardLarge deck={deck} />
                        </Link>
                    ))}
                    </div>
                </div>                
            )}
            {/* <div className="pt-[50px]">
                <div className="flex gap-1 items-center">
                    <Button size="lg" variant="secondary" className="text-2xl hover:scale-110 hover:ring ring-gray-500 ring-opacity-50">
                        Popular decks in Finnish
                    </Button>
                </div>
                <div className="flex flex-row gap-5 flex-row-3 justify-center items-center mt-5">
                    {decks.length > 0 && decks.map((deck) => (
                        <DockCardLarge key={deck} deck={deck} />
                    ))}
                </div>
            </div> */}
        </div>
    )
}
