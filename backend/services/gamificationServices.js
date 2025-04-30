function calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1
}

function applyXPMultiplier(user, xpAmount) {
    const now = new Date()
    if (user.xpMultiplierExpiration && now > user.xpMultiplierExpiration) {
        // Multiplier has expired, reset to 1x
        user.xpMultiplier = 1.0
        user.xpMultiplierExpiration = null
    }
    return Math.round(xpAmount * user.xpMultiplier) // Apply multiplier and round
}

/**
 * Updates streak based on lastActiveDate
 * Modifies user object directly.
 * Returns flags like { streakIncreased, streakStarted, streakBroken, usedStreakFreeze }
 */
function updateStreak(user, today) {
    const responsesFlag = {}
    let dayDifference = 0
}