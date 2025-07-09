import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToolTip } from "../../composables/ToolTip"
import { Delete, Download, Pencil } from "lucide-react"
import { MdAutoFixHigh } from "react-icons/md";
import { useContext, useState } from "react"
import { UserContext } from "@/contexts/UserContext"
import { formatDistance } from "date-fns";
import { getTimeStamp } from "@/utils/getTimestamp"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { TailoredCarousel } from "./TailoredCarousel";
import useUpdateCard from "@/state/hooks/useUpdateCard";
import useFetchDeck from "@/state/hooks/useFetchDeck";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "../ui/alert-dialog";

export const CreatorBar = ({id}: {id: string}) => {
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    const [chosenOptions, setChosenOptions] = useState<any[]>([])   
    const { updateCard, loading } = useUpdateCard()
    const { toast } = useToast();
    const { cards, deckName } = useFetchDeck(id);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleSave = async () => {
        try {
            for (const option of chosenOptions) {
                await updateCard(id, option._id, option.chosenOption, option.userLangCard);
            }
            setOpen(false)
            window.location.reload()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteDeck = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/decks/${id}`);
            toast({ title: "Deck deleted", description: `"${deckName}" has been deleted.` });
            setDeleteDialogOpen(false);
            setDeleteConfirm("");
            window.location.href = "/view-all-decks";
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete deck", variant: "destructive" });
        } finally {
            setDeleting(false);
        }
    }
    
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between max-w-[875px] w-full px-4 sm:px-0 mt-4">
            <div className="flex gap-4 items-center">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                    <AvatarImage src={user?.avatarUrl} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold">{user?.username}</h1>
                    <h3 className="text-sm sm:text-md text-gray-500">Created {formatDistance(getTimeStamp(id), new Date(), { addSuffix: true })}</h3>
                </div>    
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end mt-2 sm:mt-0">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger className="flex rounded-lg hover:bg-gray-200 items-center justify-center p-2">
                        <ToolTip trigger={<MdAutoFixHigh size="20" />} content="Tailor this deck with AI" />
                        <h1 className="hidden sm:inline text-sm sm:text-lg">Tailor with AI</h1>    
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-lg">Tailor your deck with AI.</DialogTitle>
                            <DialogDescription>
                                <h2 className="text-red-500 font-bold pb-2">Alert: Modify a card will reset its progress!</h2>
                                <TailoredCarousel id={id} setChosenOptions={setChosenOptions} />
                            </DialogDescription>
                            <DialogFooter>
                                <Button type="submit" onClick={handleSave} disabled={loading}>Save</Button>
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <ToolTip trigger={<Download className="w-5 h-5 sm:w-6 sm:h-6" />} content="Export this deck" />
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <ToolTip trigger={<Delete className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />} content="Delete this deck" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg flex items-center gap-2">🗑️ Delete this deck?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {cards && cards.length > 0 ? (
                          <>
                            This will permanently delete <b>“{deckName}”</b> and all its <b>{cards.length} flashcards</b>.<br />
                            You won't be able to recover it later.<br />
                            {cards.length > 20 && (
                              <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 flex items-center gap-2">
                                ⚠️ Consider exporting the deck before deletion.<br />
                                <Button variant="outline" size="sm" className="ml-2" disabled>
                                  📤 Export deck
                                </Button>
                              </div>
                            )}
                            <div className="mt-4">
                              <span className="font-semibold">Type <span className="bg-gray-200 px-1 rounded">DELETE</span> to confirm.</span>
                              <input
                                className="block mt-2 border rounded px-2 py-1 w-full"
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                placeholder="DELETE"
                                autoFocus
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            This deck has no flashcards. It will be deleted permanently.
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDeleteDeck}
                        disabled={deleting || (cards && cards.length > 0 && deleteConfirm !== "DELETE")}
                      >
                        {deleting ? "Deleting..." : "Delete Deck"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link to={`/edit-deck/${id}`} data-testid="modify-deck" className="flex rounded-lg hover:bg-gray-200 items-center p-2">
                    <ToolTip trigger={<Pencil className="w-5 h-5 sm:w-6 sm:h-6 sm:mr-2" />} content="Modify this deck" />
                    <h1 className="text-sm sm:text-lg">Edit</h1>
                </Link>
            </div>
        </div>
    )
}