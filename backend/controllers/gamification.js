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
gamificationRouter.post('/award-xp', async (request, response) => {
    try {
        const { token } = request.cookies;
        const xpAmount = Number(request.body.xpAmount) || 0
        const { activity } = request.body;

        const userData = jwt.verify(token, JWT_SECRET);
        if (!userData || !userData.id) {
            return response.status(401).json({ error: 'Invalid token data' })
        }

        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        // Add XP
        const adjustedXp = applyXPMultiplier(user, xpAmount);
        user.xp += adjustedXp;
        user.weeklyXP += adjustedXp

        // Track daily streak
        const today = new Date();
        const responseData = {
            adjustedXpGained: 0
        };

        // --- Streak Logic (Determine streak changes before deciding on XP) ---
        let dayDifference = 0
        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);

            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const lastActiveStart = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            dayDifference = Math.round((todayStart.getTime() - lastActiveStart.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDifference === 1) {
                // Consecutive day, increase streak
                user.currentStreak += 1;
                user.maxStreak = Math.max(user.maxStreak, user.currentStreak);
                responseData.streakIncreased = true;
            } else if (dayDifference > 1) {
                // Streak broken
                if (user.streakFreezes > 0) {
                    user.streakFreezes -= 1;
                    responseData.usedStreakFreeze = true;
                } else {
                    user.currentStreak = 0;
                    responseData.streakBroken = true;
                }
            }
        } else {
            // First activity ever
            user.currentStreak = 1;
            user.maxStreak = 1;
            responseData.streakStarted = true;
        }

        // --- Daily Login XP Check ---
        let alreadyRewardDailyLoginToday = false;
        if (activity === 'daily_login' && user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate)
            // Check if the last active date is the same calendar day as today
            if (lastActive.toDateString() === today.toDateString()) {
                alreadyRewardDailyLoginToday = true;
                console.log("Daily login XP already rewarded today")
            }
        }

        // --- Award XP (conditionally for daily login) ---
        if (activity !== 'daily_login' || (activity === 'daily_login' && !alreadyRewardDailyLoginToday)) {
            // Award XP if it's not a daily login OR if it is the first daily login today
            const adjustedXp = applyXPMultiplier(user, xpAmount)
            if (adjustedXp > 0) { // Only add if there's actually XP to add
                user.xp += adjustedXp
                user.weeklyXP += adjustedXp
                responseData.adjustedXpGained = adjustedXp
                console.log(`Awarded ${adjustedXp} XP for activity: ${activity}`)
            }
        }

        // --- Always update lastActiveDate ---
        // Do this *after* comparing with 'today' but before saving
        user.lastActiveDate = today

        // --- Post-XP Award Logic ---

        // Calculate new level (based on potentially updated XP)
        const newLevel = calculateLevel(user.xp)

        // Level up logic
        if (newLevel > user.level) {
            const levelsGained = newLevel - user.level
            user.level = newLevel
            // Award level-up bonuses based on the *new* level reached
            if (newLevel <= 10) {
                user.streakFreezes += levelsGained // Add freezes for each level gained up to 10
                // TODO: Add response flag for level up?
            }
            // ...other level up rewards...
        }

        // Streak rewards (check if streak *just* reached the milestone)
        if (user.currentStreak === 3 && responseData.streakIncreased) {
            const bonusXp = applyXPMultiplier(user, 50);
            user.xp += bonusXp;
            responseData.streakReward = { type: 'xp_boost', amount: bonusXp };
            responseData.adjustedXpGained += bonusXp
        } else if (user.currentStreak === 7 && responseData.streakIncreased) {
            user.xpMultiplier = 1.2;
            user.xpMultiplierExpiration = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            user.streakFreezes += 1;
            responseData.streakReward = {
                type: 'xp_multiplier',
                multiplier: 1.2,
                expires: user.xpMultiplierExpiration,
                extra: { type: 'streak_freeze', amount: 1 }
            };
        } else if (user.currentStreak === 30 && responseData.streakIncreased) {
            const achievementName = '30-Day Streak'
            if (!user.achievements.some(a => a.name === achievementName)) {
                user.achievements.push({
                    name: achievementName,
                    description: 'Maintained a 30-day streak'
                })
            }
            responseData.streakReward = { type: 'achievement', name: '30-Day Streak' };
        } 
        // Add other streak rewards here....

        // Add achievements based on activities
        const achievementMap = {
            'translate': { name: 'First Step', description: 'Translate your first phrase!' },
            'quiz_complete': { name: 'Quiz Champion', description: 'Complete a quiz' },
            'daily_login': { name: 'Daily Visitor', description: 'Log in for the first time today!' }
        };

        if (achievementMap[activity]) {
            const achievement = achievementMap[activity];
            const alreadyHasAchievement = user.achievements.some(a => a.name === achievement.name)

            // Award 'Daily Visitor' only if it's the first successful login today
            if (achievement.name === 'Daily Visitor') {
                if (!alreadyHasAchievement && !alreadyRewardDailyLoginToday) {
                    user.achievements.push({ name: achievement.name, description: achievement.description })
                    // TODO: Add achievement flag to responseData?
                }
            } else if (!alreadyHasAchievement) {
                // Award other achievements only once
                user.achievements.push({ name: achievement.name, description: achievement.description })
                // TODO: Add achievement flag to responseData?
            }

        // Add badges for XP milestones
        const badgeMilestones = [
            { xp: 10000, name: 'Bronze XP', tier: 'Bronze' },
            { xp: 50000, name: 'Silver XP', tier: 'Silver' },
            { xp: 100000, name: 'Gold XP', tier: 'Gold' },
            { xp: 500000, name: 'Platinum XP', tier: 'Platinum' }
        ];

        badgeMilestones.forEach(milestone => {
            if (user.xp >= milestone.xp && !user.badges.some(b => b.name === milestone.name)) {
                user.badges.push({
                    name: milestone.name,
                    tier: milestone.tier
                });
                // TODO: Add badge flag to responseData?
            }
        });

        // Save all changes at once
        await user.save();

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
        });
    }
    } catch (error) {
        console.error('Error awarding XP:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});
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