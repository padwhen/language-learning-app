const express = require('express')
const weeklyRankingRouter = express.Router()
const User = require('../models/User')
const WeeklyRanking = require('../models/WeeklyRanking')
const { verifyToken } = require('../utils/middleware')
const cron = require('node-cron')

// Get the current week number in ISO format (YYYY-WW)
function getCurrentWeek() {
    const now = new Date()
    const year = now.getFullYear()
    // Get ISO week number
    const firstDayOfYear = new Date(year, 0, 1)
    const pastDayOfYear = (now - firstDayOfYear) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    // Format: YYYY-WW
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
}

// Get the next Monday at midnight
function getNextMonday() {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7; // Days until next Monday (0 if today is Monday)
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (daysUntilMonday || 7)); // Use 7 if today is Monday
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
}

// Helper function to calculate percentile tiers
function calculateTier(percentile) {
    if (percentile <= 10) return 'Emerald'
    if (percentile <= 25) return 'Diamond'
    if (percentile <= 50) return 'Ruby'
    return 'None'
}

// Function to process weekly rankings and reset weeklyXp
async function processWeeklyRankings() {
    try {
        const currentWeek = getCurrentWeek()
        const now = new Date()
        const nextReset = getNextMonday()

        console.log(`Processing weekly rankings for week ${currentWeek}`)

        // 1. Get all users with their weekly XP
        const users = await User.find({ weeklyXP: { $gt: 0 } })
            .select('_id username weeklyXP region')
        
        if (users.length === 0) {
            console.log('No users with XP this week.')
            return
        }

        // 2. Sort users by XP for global ranking
        const sortedUsers = [...users].sort((a, b) => b.weeklyXP - a.weeklyXP)

        // 3. Calculate global percentiles
        const globalRankings = sortedUsers.map((user, index) => {
            const percentile = Math.ceil((index + 1) / sortedUsers.length * 100)
            return {
                userId: user._id,
                username: user.username,
                xp: user.weeklyXP,
                percentile
            }
        })

        // 4. Group users by region and calculate regional percentiles
        const regionMap = new Map()

        users.forEach(user => {
            if (!user.region) return

            if (!regionMap.has(user.region)) {
                regionMap.set(user.region, [])  
            }

            regionMap.get(user.region).push({
                userId: user._id, 
                username: user.username,
                xp: user.weeklyXP
            })
        })

        // Sort each region's users by XP and calculate percentiles
        const regionalRankings = []

        for (const [region, regionUsers] of regionMap.entries()) {
            const sortedRegionUsers = [...regionUsers].sort((a, b) => b.xp - a.xp)

            const rankings = sortedRegionUsers.map((user, index) => {
                const percentile = Math.ceil((index + 1) / sortedRegionUsers.length * 100)
                return {
                    ...user,
                    percentile
                }
            })

            regionalRankings.push({
                region,
                rankings
            })
        }

        // 5. Save weekly ranking
        const weeklyRanking = new WeeklyRanking({
            week: currentWeek,
            lastReset: now,
            nextReset,
            globalRankings,
            regionalRankings
        })

        await weeklyRanking.save()

        // 6. Update user profiles with their rankings
        const updates = sortedUsers.map(async (user, index) => {
            const globalPercentile = Math.ceil((index + 1) / sortedUsers.length * 100)
            const tier = calculateTier(globalPercentile)

            let regionalPercentile = null
            if (user.region) {
                const regionData = regionalRankings.find(r => r.region === user.region)
                if (regionData) {
                    const userRegionalRank = regionData.rankings.findIndex(r => r.userId.equals(user._id))
                    if (userRegionalRank !== -1) {
                        regionalPercentile = Math.ceil((userRegionalRank + 1) / regionData.rankings.length * 100)
                    }
                }
            }

            const weeklyRecord = {
                week: currentWeek, 
                xp: user.weeklyXP,
                rank: index + 1,
                percentile: globalPercentile,
                tier,
                region: user.region
            }

            // Add tier badge if they earned one and don't already have one for this week
            const badgeName = `${tier} ${currentWeek}`
            let badgeUpdate = {}

            if (tier !== 'None' && !await User.exists({
                _id: user._id,
                'badges.name': badgeName
            })) {
                badgeUpdate = {
                    $push: {
                        badges: {
                            name: badgeName,
                            tier,
                            dateEarned: new Date()
                        }
                    }
                }
            }

            return User.updateOne(
                { _id: user._id },
                {
                    $set: { weeklyXP: 0 },
                    $push: { weeklyXPHistory: weeklyRecord },
                    ...badgeUpdate
                }
            )
        })

        await Promise.all(updates)
        console.log(`Weekly rankings proceeded for ${users.length} users`)
    } catch (error) {
        console.error(`Error processing weekly rankings: `, error)
    }
}

// Schedule weekly reset every Monday at 00:01
cron.schedule('1 0 * * 1', async () => {
    console.log('Running weekly XP reset and rankings calculation');
    await processWeeklyRankings();
})

weeklyRankingRouter.use(verifyToken)

// Get current week info
weeklyRankingRouter.get('/current-week', async (req, res) => {
    try {
        const currentWeek = getCurrentWeek()
        const nextReset = getNextMonday()

        // Check if there's already a ranking for this week
        const exisitingRanking = await WeeklyRanking.findOne({ week: currentWeek })

        res.json({
            currentWeek,
            nextReset,
            timeRemaining: nextReset.getTime() - new Date().getTime(),
            rankingsExist: !exisitingRanking
        })
    } catch (error) {
        console.error('Error getting current week info: ', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get global leaderboard for current week
weeklyRankingRouter.get('/global', async (req, res) => {
    try {
        const currentWeek = getCurrentWeek()

        // Get real-time rankings from users collection
        const users = await User.find({ weeklyXP: { $gt: 0 }})
            .select('username weeklyXP avatarUrl')
            .sort({ weeklyXP: -1 })
            .limit(100)

        const totalUsers = await User.countDocuments({ weeklyXP: { $gt: 0 }})

        // Map users to rankings with percentile
        const rankings = users.map((user, index) => {
            const percentile = Math.ceil((index + 1) / totalUsers * 100)
            return {
                rank: index + 1,
                username: user.username,
                xp: user.weeklyXP,
                percentile,
                tier: calculateTier(percentile),
                avatarUrl: user.avatarUrl
            }
        })
        res.json({
            week: currentWeek,
            nextReset: getNextMonday(),
            totalParticipants: totalUsers,
            rankings
        })
    } catch (error) {
        console.error('Error getting global leaderboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Get regional leaderboard for current week
weeklyRankingRouter.get('/regional/:region', async (req, res) => {
    try {
        const { region } = req.params
        const currentWeek = getCurrentWeek()

        // Get real-time rankings from users collection
        const users = await User.find({
            weeklyXP: { $gt: 0 }, 
            region
        })
            .select('username weeklyXP avatarUrl')
            .sort({ weeklyXP: - 1 })
            .limit(100)
        
        const totalRegionalUsers = await User.countDocuments({
            weeklyXP: { $gt: 0 }, 
            region
        })
        // Map users to rankings with percentile
        const rankings = users.map((user, index) => {
            const percentile = Math.ceil((index + 1) / totalRegionalUsers * 100)
            return {
                rank: index + 1,
                username: user.username, 
                xp: user.weeklyXP,
                percentile,
                tier: calculateTier(percentile),
                avatarUrl: user.avatarUrl
            }
        })

        res.json({
            week: currentWeek,
            region,
            nextReset: getNextMonday(),
            totalParticipants: totalRegionalUsers,
            rankings
        })
    } catch (error) {
        console.error('Error getting regional leaderboard: ', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get user's current ranking
weeklyRankingRouter.get('/my-ranking', async (req, res) => {
    try {
        const userId = req.user.id
        const currentWeek = getCurrentWeek()

        // Get user
        const user = await User.findById(userId).select('username weeklyXP region')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Get global ranking
        const globalRank = await User.countDocuments({
            weeklyXP: { $gt: user.weeklyXP }
        }) + 1

        const totalUsers = await User.countDocuments({
            weeklyXP: { $gt: 0 }
        })

        const globalPercentile = Math.ceil(globalRank / totalUsers * 100)

        // Get regional ranking if user has a region
        let regionalRank = null
        let regionalPercentile = null
        let totalRegionalUsers = null

        if (user.region) {
            regionalRank = await User.countDocuments({
                weeklyXP: { $gt: user.weeklyXP },
                region: user.region
            }) + 1

            totalRegionalUsers = await User.countDocuments({
                weeklyXP: { $gt: 0 }, 
                region: user.region
            })

            regionalPercentile = Math.ceil(regionalRank / totalRegionalUsers * 100)
        }

        res.json({
            week: currentWeek,
            nextReset: getNextMonday(),
            username: user.username,
            weeklyXP: user.weeklyXP,
            global: {
                rank: globalRank,
                percentile: globalPercentile,
                tier: calculateTier(globalPercentile),
                totalParticipants: totalUsers
            },
            regional: user.region ? {
                region: user.region,
                rank: regionalRank,
                percentile: regionalPercentile,
                tier: calculateTier(regionalPercentile),
                totalParticipants: totalRegionalUsers
            } : null
        })
    } catch (error) {
        console.error('Error getting user rankings: ', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get historical week rankings
weeklyRankingRouter.get('/history/:week', async (req, res) => {
    try {
        const { week } = req.params
        const ranking = await WeeklyRanking.findOne({ week })
        if (!ranking) {
            return res.status(404).json({ error: 'No rankings found for this week' })
        }
        res.json({
            week: ranking.week,
            lastReset: ranking.lastReset,
            globalRankings: ranking.globalRankings.slice(0, 100),
            totalParticipants: ranking.globalRankings.length
        })
    } catch (error) {
        console.error('Error getting historical rankings: ', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get user's historical rankings
weeklyRankingRouter.get('/my-history', async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select('weeklyXPHistory')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({
            history: user.weeklyXPHistory.sort((a, b) => {
                // Sort by week in descending order (newest first)
                return b.week.localeCompare(a.week)
            })
        })
    } catch (error) {
        console.error('Error getting user ranking history:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Update user's region 
weeklyRankingRouter.post('/update-region', async (req, res) => {
    try {
        const userId = req.user.id
        const { region } = req.body

        if (!region) {
            return res.status(400).json({ error: 'Region is required' })
        }

        await User.updateOne({ _id: userId }, { region })
        res.json({ success: true, region })
    } catch (error) {
        console.error('Error updating user region:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = weeklyRankingRouter