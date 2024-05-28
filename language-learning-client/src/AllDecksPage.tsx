import { Link } from "react-router-dom"
import { DockCardLarge } from "./components/DockCardLarge"
import { Button } from "./components/ui/button"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";

export const AllDecks = () => {
    const { user } = useContext(UserContext);
    const [decks, setDecks] = useState([])
    const fetchData = async () => {
        const response = await axios.get('/decks')
        setDecks(response.data)
    }
    useEffect(() => {
        fetchData()
    }, [])
    return (
        <div className="pt-[30px] ml-5">
            <div className="flex items-center justify-center pr-[50px]">
                    <h1 className="text-4xl font-bold text-gray-900">@{user?.username} all decks</h1>
            </div>
            <div className="pt-[50px]">
                <div className="flex gap-1 items-center">
                    <Button size="lg" variant="secondary" className="text-2xl hover:scale-110 hover:ring ring-gray-500 ring-opacity-50">
                        Recent
                    </Button>
                </div>
                <div className="flex flex-row gap-5 flex-row-3 justify-center items-center mt-5">
                    {decks.length > 0 && decks.map((deck: any) => (
                        <Link to={`/view-decks/${deck._id}`}><DockCardLarge key={deck} deck={deck} /></Link>
                    ))}
                </div>
            </div>
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
