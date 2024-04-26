export const User = () => {
    return (
        <div className="flex items-center justify-start"> 
            <div className="w-64 flex flex-col bg-white border border-blue-600 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div className="p-2">
                <h1 className="text-2xl gap-2 font-bold text-gray-800 dark:text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Username
                </h1>
                <a className="mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400" href="#">
                    Log Out
                </a>
                <a className="mt-3 justify-center flex items-center gap-x-1 text-md font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400" href="#">
                    View All Your Decks
                </a>
                </div>  
            </div>
        </div>
    )
}