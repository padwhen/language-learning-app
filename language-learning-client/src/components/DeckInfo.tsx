export const DeckInfo = () => {
    return (
        <div className="flex items-center justify-start mt-5"> 
            <div className="w-64 flex flex-col bg-white border border-t-4 border-t-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div className="p-4">
                <h1 className="text-2xl gap-2 font-bold text-gray-800 dark:text-white">
                    Example dock
                </h1>
                <div className="mt-2">
                    <div className="flex justify-between items-center">
                        <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white">Language</h3>
                        <span className="text-sm text-gray-800 dark:text-white">Finnish</span>    
                    </div>
                </div>
                <div className="mt-1">
                    <div className="flex justify-between items-center">
                        <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white">Set</h3>
                        <span className="text-sm text-gray-800 dark:text-white">89 flashcards</span>    
                    </div>
                </div>
                <div className="mt-1">
                    <div className="mb-1 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Progress</h3>
                        <span className="text-sm text-gray-800 dark:text-white">25%</span>
                    </div>
                    <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700" role="progressbar" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                        <div className="w-1/4 flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500 dark:bg-blue-500"></div>
                    </div>
                </div>
                <a className="mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400" href="#">
                    View Details
                </a>
                </div>  
            </div>
        </div>
    )
}