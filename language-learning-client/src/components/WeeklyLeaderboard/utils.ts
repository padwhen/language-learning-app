export const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}m`
}

export const getTierColor = (tier: string) => {
    switch (tier) {
        case 'Emerald': return 'bg-emerald-500 hover:bg-emerald-600'
        case 'Diamond': return 'bg-sky-400 hover:bg-sky-500'
        case 'Ruby': return 'bg-red-500 hover:bg-red-600'
        default: return 'bg-gray-500 hover:bg-gray-600'
    }
}
