import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Word } from "@/types"
import { DialogClose } from "@radix-ui/react-dialog"
import { CurrentDecks } from "./CurrentDecks"
import { useState } from "react"

export const Modal: React.FC<{word: Word}> = ({word}) => {
  const [deckNames, setDecksNames] = useState<string[]>([]);
  const [displayCurrentDecks, setDisplayCurrentDecks] = useState<boolean>(true);
  console.log(deckNames)
  const { fi, en, pronunciation, original_word, comment } = word;
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
              <h4 className="text-md font-bold text-gray-800 min-w-[150px]">Original word</h4>
              <p className="text-gray-800 text-md">{original_word}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-md font-bold text-gray-800 min-w-[150px]">Pronunciation</h4>
              <p className="text-gray-800 text-md">{pronunciation}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-md font-bold text-gray-800 min-w-[150px]">Meaning</h4>
              <p className="text-gray-800 text-md">{en}</p>
            </div>
            <div className="flex mt-1 gap-2">
              <h4 className="text-md font-bold text-gray-800 min-w-[150px]">Explanation</h4>
              <p className="text-gray-800 text-md">{comment}</p>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Dialog>
            <DialogTrigger>
            {deckNames.length === 0 ? (
                <Button type="submit">Save this to a deck</Button>
              ) : (
                <Button type="submit">{deckNames.join(" / ")}</Button>
              )}
            </DialogTrigger>
            {displayCurrentDecks && (
              <DialogContent className="p-0">
                <CurrentDecks deckNames={deckNames} setDecksName={setDecksNames} setDisplayCurrentDecks={setDisplayCurrentDecks} />
              </DialogContent>  
            )}
          </Dialog>
          <DialogClose>
            <Button type="submit" className="bg-gray-500">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
