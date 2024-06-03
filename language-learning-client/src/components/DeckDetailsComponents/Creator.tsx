import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToolTip } from "../../composables/ToolTip"
import { Delete, Download, Pencil } from "lucide-react"
import { useContext } from "react"
import { UserContext } from "@/UserContext"
import { formatDistance } from "date-fns";
import { getTimeStamp } from "@/utils/getTimestamp"
import { Link } from "react-router-dom"

export const CreatorBar = ({id}: {id: string}) => {
    const { user } = useContext(UserContext)
    
    return (
        <div className="flex gap-2 justify-between max-w-[875px]">
            <div className="flex gap-4 items-center justify-center">
                <Avatar className="w-12 h-12">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-semibold">{user?.username}</h1>
                    <h3 className="text-md text-gray-500">Created {formatDistance(getTimeStamp(id), new Date(), { addSuffix: true })}</h3>
                </div>    
            </div>
            <div className="flex gap-2 items-center justify-center">
                <ToolTip trigger={<Download />} content="Export this deck" />
                <ToolTip trigger={<Delete />} content="Delete this deck" />
                <Link to={`/edit-deck/${id}`}><ToolTip trigger={<Pencil />} content="Modify this deck" /></Link>
            </div>
        </div>
    )
}