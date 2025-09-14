import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Word } from "@/types"
import { DialogClose } from "@radix-ui/react-dialog"
import { useContext, useState } from "react"
import { NewDeckCard } from "./NewDeckCard"
import axios from "axios"
import { UserContext } from "@/contexts/UserContext"
import { LoginPage } from "../UsersComponents/LoginPage"
import { DisplayCurrentDecks } from "./DisplayCurrentDecks"
import { useToast } from "@/components/ui/use-toast"
import { ContextTip } from "./ContextTip"
import { cookieDismissed } from "@/utils/cookie"

export const Modal: React.FC<{word: Word}> = ({word}) => {
  const { user } = useContext(UserContext)
  const [openNewDeck, setOpenNewDeck] = useState<boolean>(false)
  const { fi, en_base, en, pronunciation, original_word, comment } = word;

  // Context tip state
  const defaultSaveAs = (user?.flashcardWordForm as 'original' | 'base') === 'base' ? 'base' : 'original';
  const [saveAs, setSaveAs] = useState<'original' | 'base'>(defaultSaveAs);

  // Compute if tip should show
  const shouldShowTip = 
    original_word?.trim().toLowerCase() !== fi?.trim().toLowerCase() &&
    (user?.flashcardWordForm as 'original' | 'base') !== 'base' &&
    !cookieDismissed();

  // Debug logging
  console.log('WordModal Debug:', {
    fi,
    original_word,
    wordsAreDifferent: original_word?.trim().toLowerCase() !== fi?.trim().toLowerCase(),
    userPref: user?.flashcardWordForm,
    cookieDismissed: cookieDismissed(),
    shouldShowTip
  });

  const { toast } = useToast()

  const saveWordToDeck = async (deckId: string) => {
    try {
      // Determine what to save based on user choice
      const isBase = saveAs === 'base';
      const userLangCard = isBase ? original_word : fi;
      const engCard = isBase ? (en_base || en) : en;

      const wordResponse = await axios.post('/cards', { engCard, userLangCard });
      const newCard = { 
        _id: wordResponse.data._id,
        engCard,
        userLangCard,
        cardScore: 0,
        favorite: false
      };
      await axios.put(`/decks/${deckId}/add-card`, newCard);
      const localStorageKey = "response";
      const storedResponse = localStorage.getItem(localStorageKey);
      const response = storedResponse ? JSON.parse(storedResponse) : {};
      if (response.words) {
        const updatedWords = response.words.filter((w: Word) => w.original_word !== word.original_word);
        localStorage.setItem(localStorageKey, JSON.stringify({ ...response, words: updatedWords }));
      }
      const deckName = await fetchDeckName(deckId);
      toast({
        title: `${userLangCard} just added!`,
        description: `Added to deck ${deckName}: ${userLangCard} - Translated as ${engCard}`
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
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] md:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="text-4xl mt-2">{fi}</DialogTitle>  
        </DialogHeader>
        <DialogDescription className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <h4 className="text-base font-bold text-gray-800 sm:min-w-[130px]">Base word</h4>
            <p className="text-gray-800 text-base">{original_word} {en === en_base ? '' : `- ${en_base}`}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <h4 className="text-base font-bold text-gray-800 sm:min-w-[130px]">Pronunciation</h4>
            <p className="text-gray-800 text-base">{pronunciation}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <h4 className="text-base font-bold text-gray-800 sm:min-w-[130px]">Meaning</h4>
            <p className="text-gray-800 text-base">{en}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <h4 className="text-base font-bold text-gray-800 sm:min-w-[130px]">Explanation</h4>
            <p className="text-gray-800 text-base break-words">{comment}</p>
          </div>

          {shouldShowTip && (
            <ContextTip
              surfaceForm={fi}
              en={en}
              en_base={en_base!}
              lemma={original_word}
              defaultSaveAs={defaultSaveAs}
              onChange={setSaveAs}
            />
          )}
        </DialogDescription>
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-3">
          <Dialog>
            <DialogTrigger>
                <Button type="submit" className="w-full sm:w-auto text-base py-2">Save this to a deck</Button>
            </DialogTrigger>
              <DialogContent className={user ? "p-0 flex gap-4 flex-grow-1" : ""}>
                {user ? (
                  <DisplayCurrentDecks onSelectDeck={saveWordToDeck} />) : (<>
                <DialogTitle className="text-2xl sm:text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                <LoginPage /></>)}
                {openNewDeck && <NewDeckCard setOpenNewDeck={setOpenNewDeck} />}
              </DialogContent>
          </Dialog>
          <DialogClose>
            <Button type="submit" className="bg-gray-500 w-full sm:w-auto text-base py-2">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
