import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Word } from "@/types"
import { DialogClose } from "@radix-ui/react-dialog"
import { CurrentDecks } from "./CurrentDecks"
import { useContext, useState } from "react"
import { NewDeckCard } from "./NewDeckCard"
import axios from "axios"
import { UserContext } from "@/UserContext"
import { LoginPage } from "./UsersComponents/LoginPage"

export const Modal: React.FC<{word: Word}> = ({word}) => {
  const { user } = useContext(UserContext)
  const [deckNames, setDecksNames] = useState<{id: string; name: string}[]>([]);
  const [displayCurrentDecks, setDisplayCurrentDecks] = useState<boolean>(true);
  const [openNewDeck, setOpenNewDeck] = useState<boolean>(false)
  const { fi, en, pronunciation, original_word, comment } = word;

  const saveWordToDeck = async (deckId: string) => {
    try {
      const wordResponse = await axios.post('/cards', { engCard: en, userLangCard: original_word })
      await axios.put(`/decks/${deckId}`, { 
        cards: [{ 
          _id: wordResponse.data._id,
          engCard: en, userLangCard: original_word, cardScore: 0
        }]
      })
    } catch (error) {
      console.error('Error saving word: ', error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="m-1 py-1 px-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white text-md hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">{fi}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[525px] h-[300px]">
        <DialogHeader>
            <DialogTitle className="text-4xl mt-2">{fi}</DialogTitle>  
        </DialogHeader>
        <DialogDescription>
          <div className="overflow-y-auto">
            <div className="flex mt-1 gap-2">
              <h4 className="text-lg/6 font-bold text-gray-800 min-w-[150px]">Original word</h4>
              <p className="text-gray-800 text-lg/6">{original_word}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-lg/6 font-bold text-gray-800 min-w-[150px]">Pronunciation</h4>
              <p className="text-gray-800 text-lg/6">{pronunciation}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-lg/6 font-bold text-gray-800 min-w-[150px]">Meaning</h4>
              <p className="text-gray-800 text-lg/6">{en}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-lg/6 font-bold text-gray-800 min-w-[150px]">Explanation</h4>
              <p className="text-gray-800 text-lg/6">{comment}</p>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Dialog>
            <DialogTrigger>
            {deckNames.length === 0 ? (
                <Button type="submit">Save this to a deck</Button>
              ) : (
                <Button type="submit">
                  {deckNames.map(deck => deck.name).join(" / ")}
                </Button>
              )}
            </DialogTrigger>
            {displayCurrentDecks && (
              <DialogContent className={user ? "p-0 flex gap-4 flex-grow-1" : "max-w-[455px] h-[350px]"}>
                {user ? (
                  <CurrentDecks
                    deckNames={deckNames} 
                    setDecksName={setDecksNames} 
                    displayCurrentDecks = {displayCurrentDecks}
                    setDisplayCurrentDecks={setDisplayCurrentDecks}
                    setOpenNewDeck={setOpenNewDeck}
                    openNewDeck={openNewDeck}
                    onSelectDeck={saveWordToDeck}
                    word={fi}
                  />) : (<>
                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                <LoginPage /></>)}
                {openNewDeck && <NewDeckCard setOpenNewDeck={setOpenNewDeck} />}
              </DialogContent>)}
          </Dialog>
          <DialogClose>
            <Button type="submit" className="bg-gray-500">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
