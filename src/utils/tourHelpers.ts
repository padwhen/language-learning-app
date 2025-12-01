export const removeTourFromUrl = (): string => {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('tour')
    return newUrl.pathname
}

export const getTourHighlights = (): string[] => [
    'profile-picture', 'user-stats', 'achievements', 'personal-info'
]