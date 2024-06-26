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
        <div className="flex gap-2 justify-between max-w-[875px]">
            <div className="flex gap-4 items-center justify-center">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatarUrl} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-semibold">{user?.username}</h1>
                    <h3 className="text-md text-gray-500">Created {formatDistance(getTimeStamp(id), new Date(), { addSuffix: true })}</h3>
                </div>    
            </div>
            <div className="flex gap-2 items-center justify-center">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger className="flex rounded-lg hover:bg-gray-200 items-center justify-center">
                        <ToolTip trigger={<MdAutoFixHigh size="25" />} content="Tailor this deck with AI" />
                        <h1 className="text-lg items-center justify-center flex px-2">Tailor with AI</h1>    
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
                <ToolTip trigger={<Download />} content="Export this deck" />
                <ToolTip trigger={<Delete />} content="Delete this deck" />
                <Link to={`/edit-deck/${id}`} data-testid="modify-deck" className="flex rounded-lg hover:bg-gray-200">
                    <ToolTip trigger={<Pencil />} content="Modify this deck" />
                    <h1 className="text-lg items-center justify-center flex px-2">Edit</h1>
                </Link>
            </div>
        </div>
    )
}