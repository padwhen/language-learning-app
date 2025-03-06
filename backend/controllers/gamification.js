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
        user.xp += xpAmount

        // Calculate new level
        const newLevel = calculateLevel(user.xp)

        // Level up logic
        if (newLevel > user.level) {
            user.level = newLevel

            // Add level up achievements/rewards
            if (newLevel <= 10) {
                // Increase deck slots
                // This would be managed in the frontend or deck creation logic
            } else if (newLevel <= 20) {
                // Unlock advanced features like adding pictures to flashcards
            } else if (newLevel <= 30) {
                // Unlock audio pronunciation
            }
        }

        // Track daily streak
        const today = new Date()
        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate)
            const dayDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))

            if (dayDifference === 1) {
                // Consecutive day, increase streak
                user.currentStreak += 1
                user.maxStreak = Math.max(user.maxStreak, user.currentStreak)
            } else if (dayDifference > 1) {
                // Streak broken
                if (user.streakFreezes > 0) {
                    // Use a streak freeze
                    user.streakFreezes -= 1
                } else {
                    // Reset streak
                    user.currentStreak = 0
                }
            }
        }

        // Update last active date
        user.lastActiveDate = today

        // Add achievements based on activities
        const achievementMap = {
            'translate': { name: 'First Step', description: 'Translate your first phrase!' },
            'quiz_complete': { name: 'Quiz Champion', description: 'Complete a quiz' },
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
            achievements: user.achievements,
            badges: user.badges
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

        response.json({
            level: user.level,
            xp: user.xp,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
            streakFreezes: user.streakFreezes,
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