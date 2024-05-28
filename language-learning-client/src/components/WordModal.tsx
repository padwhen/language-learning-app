import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Word } from "@/types"
import { DialogClose } from "@radix-ui/react-dialog"
import { useContext, useState } from "react"
import { NewDeckCard } from "./NewDeckCard"
import axios from "axios"
import { UserContext } from "@/UserContext"
import { LoginPage } from "./UsersComponents/LoginPage"
import { DisplayCurrentDecks } from "./DisplayCurrentDecks"
import { useToast } from "@/components/ui/use-toast"

export const Modal: React.FC<{word: Word}> = ({word}) => {
  const { user } = useContext(UserContext)
  const [openNewDeck, setOpenNewDeck] = useState<boolean>(false)
  const { fi, en, pronunciation, original_word, comment } = word;

  const { toast } = useToast()

  const saveWordToDeck = async (deckId: string) => {
    try {
      const wordResponse = await axios.post('/cards', { engCard: en, userLangCard: original_word });
      await axios.put(`/decks/${deckId}`, { 
        cards: [{ 
          _id: wordResponse.data._id,
          engCard: en, userLangCard: original_word, cardScore: 0
        }]
      });
      const localStorageKey = "response";
      const storedResponse = localStorage.getItem(localStorageKey);
      const response = storedResponse ? JSON.parse(storedResponse) : {};
      if (response.words) {
        const updatedWords = response.words.filter((w: Word) => w.original_word !== word.original_word);
        localStorage.setItem(localStorageKey, JSON.stringify({ ...response, words: updatedWords }));
      }
      const deckName = await fetchDeckName(deckId);
      toast({
        title: `${word.original_word} just added!`,
        description: `Added to deck ${deckName}: ${word.original_word} - Translated as ${word.en}`
      })
      setTimeout(() => { window.location.reload() }, 1500)
    } catch (error) {
      console.error('Error saving word: ', error);
    }
  };

  const fetchDeckName = async (deckId: string): Promise<string> => {
    try {
      const response = await axios.get(`/decks/${deckId}`)
      return response.data.deckName;
    } catch (error) {
      console.error('Error fetching deck name: ', error)
      return ''
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
                <Button type="submit">Save this to a deck</Button>
            </DialogTrigger>
              <DialogContent className={user ? "p-0 flex gap-4 flex-grow-1" : "max-w-[455px] h-[350px]"}>
                {user ? (
                  <DisplayCurrentDecks onSelectDeck={saveWordToDeck} />) : (<>
                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                <LoginPage /></>)}
                {openNewDeck && <NewDeckCard setOpenNewDeck={setOpenNewDeck} />}
              </DialogContent>
          </Dialog>
          <DialogClose>
            <Button type="submit" className="bg-gray-500">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
