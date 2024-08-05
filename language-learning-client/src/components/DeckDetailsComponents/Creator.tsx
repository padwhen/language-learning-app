import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToolTip } from "../../composables/ToolTip"
import { Delete, Download, Pencil } from "lucide-react"
import { MdAutoFixHigh } from "react-icons/md";
import { useContext, useState } from "react"
import { UserContext } from "@/UserContext"
import { formatDistance } from "date-fns";
import { getTimeStamp } from "@/utils/getTimestamp"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { TailoredCarousel } from "./TailoredCarousel";
import useUpdateCard from "@/state/hooks/useUpdateCard";

export const CreatorBar = ({id}: {id: string}) => {
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    const [chosenOptions, setChosenOptions] = useState<any[]>([])   
    const { updateCard, loading } = useUpdateCard()

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
                <ToolTip trigger={<Delete className="w-5 h-5 sm:w-6 sm:h-6" />} content="Delete this deck" />
                <Link to={`/edit-deck/${id}`} data-testid="modify-deck" className="flex rounded-lg hover:bg-gray-200 items-center p-2">
                    <ToolTip trigger={<Pencil className="w-5 h-5 sm:w-6 sm:h-6 sm:mr-2" />} content="Modify this deck" />
                    <h1 className="text-sm sm:text-lg">Edit</h1>
                </Link>
            </div>
        </div>
    )
}