const express = require('express')
const gamificationRouter = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')
const { verifyToken } = require('../utils/middleware')

// Middleware to verify token for all gamification routes
gamificationRouter.use(verifyToken)

// Helper function to calculate level based on XP
function calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Helper function to check and apply XP multiplier
function applyXPMultiplier(user, xpAmount) {
    const now = new Date()
    if (user.xpMultiplierExpiration && now > user.xpMultiplierExpiration) {
        // Multiplier has expired, reset to 1x
        user.xpMultiplier = 1.0
        user.xpMultiplierExpiration = null
    }
    return Math.round(xpAmount * user.xpMultiplier) // Apply multiplier and round
}

// Award XP for various activities
gamificationRouter.post('/award-xp', async (request, response) => {
    try {
        const { token } = request.cookies
        const { xpAmount, activity } = request.body
        const userData = jwt.verify(token, JWT_SECRET)

        const user = await User.findById(userData.id)
        if (!user) {
            return response.status(404).json({ error: 'User not found' })
        }

        // Add XP
        const adjustedXp = applyXPMultiplier(user, xpAmount)
        user.xp += adjustedXp

        // Calculate new level
        const newLevel = calculateLevel(user.xp)

        // Level up logic
        if (newLevel > user.level) {
            user.level = newLevel

            // Add level up achievements/rewards
            if (newLevel <= 10) {
                // Increase deck slots
                // This would be managed in the frontend or deck creation logic
                user.streakFreezes += 1
            } else if (newLevel <= 20) {
                // Unlock advanced features like adding pictures to flashcards
            } else if (newLevel <= 30) {
                // Unlock audio pronunciation
            }
        }

        // Track daily streak
        const today = new Date()
        const responseData = {};

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate)
            const dayDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))

            if (dayDifference === 1) {
                // Consecutive day, increase streak
                user.currentStreak += 1
                user.maxStreak = Math.max(user.maxStreak, user.currentStreak)
                responseData.streakIncreased = true
            } else if (dayDifference > 1) {
                // Streak broken
                if (user.streakFreezes > 0) {
                    // Use a streak freeze
                    user.streakFreezes -= 1
                    responseData.usedStreakFreeze = true; // Indicate freeze was used
                } else {
                    // Reset streak
                    user.currentStreak = 0
                    responseData.streakBroken = true
                }
            } else if (dayDifference === 0) {
                // Same day, no streak change
                responseData.streakUnchanged = true;
            } else {
                // First activity ever
                user.currentStreak = 1
                user.maxStreak = 1
                responseData.streakStarted = true;
            }

            // Update last active date
            user.lastActiveDate = today

            // Streak rewards
            if (user.currentStreak === 3) {
                const bonusXp = applyXPMultiplier(user, 50) // Apply multiplier to bonus
                user.xp += bonusXp
                responseData.streakReward = { type: 'xp_boost', amount: bonusXp }
            } else if (user.currentStreak === 7) {
                user.xpMultiplier = 1.2
                user.xpMultiplierExpiration = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Expires in 24 hours
                user.streakFreezes += 1
                responseData.streakReward = { 
                    type: 'xp_multiplier', 
                    multiplier: 1.2, 
                    expires: user.xpMultiplierExpiration,
                    extra: { type: 'streak_freeze', amount: 1 }
                }
            } else if (user.currentStreak === 30) {
                user.achievements.push({
                    name: '30-Day streak',
                    description: 'Maintained a 30-day streak'
                })
                responseData.streakReward = { type: 'achievement', name: '30-Day Streak'}
            }
        }

        // Add achievements based on activities
        const achievementMap = {
            'translate': { name: 'First Step', description: 'Translate your first phrase!' },
            'quiz_complete': { name: 'Quiz Champion', description: 'Complete a quiz' },
            'daily_login': { name: 'Daily Visitor', description: 'Log in for the first time today!' }
            //
        }

        if (achievementMap[activity] && !user.achievements.some(a => a.name === achievementMap[activity].name)) {
            user.achievements.push({
                name: achievementMap[activity].name,
                description: achievementMap[activity].description
            })
        }

        // Add badges for XP milestones
        const badgeMilestones = [
            { xp: 10000, name: 'Bronze XP', tier: 'Bronze' },
            { xp: 50000, name: 'Silver XP', tier: 'Silver' },
            { xp: 100000, name: 'Gold XP', tier: 'Gold' },
            { xp: 500000, name: 'Platinum XP', tier: 'Platinum' }
        ]

        badgeMilestones.forEach(milestone => {
            if (user.xp >= milestone.xp && !user.badges.some(b => b.name === milestone.name)) {
                user.badges.push({
                    name: milestone.name,
                    tier: milestone.tier
                })
            }
        })

        await user.save()

        response.json({
            xp: user.xp, 
            level: user.level,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
            streakFreezes: user.streakFreezes,
            achievements: user.achievements,
            badges: user.badges,
            lastActiveDate: user.lastActiveDate,
            xpMultiplier: user.xpMultiplier, 
            xpMultiplierExpiration: user.xpMultiplierExpiration,
            adjustedXpGained: adjustedXp,
            ...responseData
        })
    } catch (error) {
        console.error('Error awarding XP:', error)
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get user's gamification stats
gamificationRouter.get('/stats', async (request, response) => {
    try {
        const { token } = request.cookies
        const userData = jwt.verify(token, JWT_SECRET)
        
        const user = await User.findById(userData.id)
        if (!user) {
            return response.status(404).json({ error: 'User not found' })
        }

        // Check and reset expired multiplier
        applyXPMultiplier(user, 0) // Just to trigger expiration check
        await user.save()

        response.json({
            level: user.level,
            xp: user.xp,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
            lastActiveDate: user.lastActiveDate,
            streakFreezes: user.streakFreezes,
            xpMultiplier: user.xpMultiplier,
            xpMultiplierExpiration: user.xpMultiplierExpiration,
            achievements: user.achievements,
            badges: user.badges
        })
    } catch (error) {
        console.error('Error fetching gamification stats:', error)
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

// Use a streak freeze
gamificationRouter.post('/use-streak-freeze', async (request, response) => {
    try {
        const { token } = request.cookies
        const userData = jwt.verify(token, JWT_SECRET)

        const user = await User.findById(userData.id)
        if (!user) {
            return response.status(404).json({ error: 'User not found' })
        }

        if (user.streakFreezes > 0) {
            user.streakFreezes -= 1
            // Prevent streak reset
            await user.save()
            response.json({
                success: true,
                streakFreezes: user.streakFreezes
            })
        } else {
            response.status(400).json({ error: 'No streak freezes available' })
        }
    } catch (error) {
        console.error('Error using streak freeze: ', error)
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

module.exports = gamificationRouter