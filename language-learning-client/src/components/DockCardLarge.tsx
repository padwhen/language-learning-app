import { Progress } from "./ui/progress"

export const DockCardLarge = () => {
    return (
        <div className="w-[400px] border-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300 hover:border-b-2 hover:border-blue-500">
            <div className="ml-4 pt-2">
                <h1 className="text-2xl font-semibold mt-2">Finnish for beginners</h1>
                <div className="flex items-center gap-5 mt-2">
                    <h3 className="text-lg">87% complete</h3>
                    <Progress value={60} className="w-[200px] h-3" />
                </div>
                <div className="mb-5 mt-3 flex gap-2">
                    <h1 className="px-4 py-1 bg-blue-500 text-white rounded-full inline-block">67 terms</h1>
                    <h1 className="px-4 py-1 bg-blue-500 text-white rounded-full inline-block">finnish</h1>
                </div>
            </div>

        </div>
    )
}