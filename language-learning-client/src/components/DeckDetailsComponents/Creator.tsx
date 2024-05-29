import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToolTip } from "../../composables/ToolTip"
import { Delete, Download, Pencil } from "lucide-react"
import { useContext } from "react"
import { UserContext } from "@/UserContext"

export const CreatorBar = () => {
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
                    <h3 className="text-md text-gray-500">Created 2 weeks ago</h3>
                </div>    
            </div>
            <div className="flex gap-2 items-center justify-center">
                <ToolTip trigger={<Download />} content="Export this deck" />
                <ToolTip trigger={<Delete />} content="Delete this deck" />
                <ToolTip trigger={<Pencil />} content="Modify this deck" />
            </div>
        </div>
    )
}