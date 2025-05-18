// backend/controllers/gamification.js
const express = require('express');
const gamificationRouter = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const { verifyToken } = require('../utils/middleware');
// Import the service
const gamificationService = require('../services/gamificationServices');

// Middleware to verify token
gamificationRouter.use(verifyToken);

// Award XP Endpoint (Refactored)
gamificationRouter.post('/award-xp', async (request, response) => {
    try {
        const { token } = request.cookies;
        const xpAmount = Number(request.body.xpAmount) || 0;
        const { activity } = request.body;

        // 1. Verify Token & Find User
        const userData = jwt.verify(token, JWT_SECRET);
        if (!userData || !userData.id) {
            return response.status(401).json({ error: 'Invalid token data' });
        }
        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        console.log("--- Award XP Start ---");
        console.log(`User: ${user.username}, Activity: ${activity}, Base XP: ${xpAmount}`);
        console.log("Before:", { ls: user.lastActiveDate, cs: user.currentStreak, xp: user.xp });

        const today = new Date();
        let responseData = {}; // Collect results and flags

        // 2. Update Streak Logic
        const streakFlags = gamificationService.updateStreak(user, today);
        Object.assign(responseData, streakFlags); // Add flags like streakIncreased

        // 3. Award XP (handles daily login check & multiplier)
        const { xpAwarded, alreadyAwardedDailyLoginToday } = gamificationService.awardExperience(user, xpAmount, activity, today);
        responseData.adjustedXpGained = xpAwarded;

        // 4. Check Level Up
        const levelUpInfo = gamificationService.checkAndApplyLevelUp(user);
        if (levelUpInfo) Object.assign(responseData, { levelUpInfo }); // Add level up details if it happened

        // 5. Check Streak Rewards (pass streakIncreased flag)
        const streakRewardData = gamificationService.checkAndApplyStreakRewards(user, responseData.streakIncreased || false, today);
        if (streakRewardData) {
            Object.assign(responseData, streakRewardData);
            // If bonus XP was given, add it to the total reported gain for this call
            if(streakRewardData.streakReward?.type === 'xp_boost'){
                responseData.adjustedXpGained += streakRewardData.streakReward.amount;
            }
        }


        // 6. Check Achievements
        const achievementData = gamificationService.checkActivityAchievements(user, activity, alreadyAwardedDailyLoginToday);
         if (achievementData) Object.assign(responseData, achievementData);

        // 7. Check Badges
        const badgeData = gamificationService.checkXpBadges(user);
         if (badgeData) Object.assign(responseData, badgeData);

        // 8. Update Last Active Date (Crucial: do this *after* all checks for the day)
        user.lastActiveDate = today;

        // 9. Save User
        await user.save();

        console.log("After:", { ls: user.lastActiveDate, cs: user.currentStreak, xp: user.xp, gained: responseData.adjustedXpGained });
        console.log("--- Award XP End ---");


        // 10. Send Response
        response.json({
            // Core stats
            xp: user.xp,
            level: user.level,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
            streakFreezes: user.streakFreezes,
            achievements: user.achievements, // Send updated arrays
            badges: user.badges,             // Send updated arrays
            lastActiveDate: user.lastActiveDate,
            xpMultiplier: user.xpMultiplier,
            xpMultiplierExpiration: user.xpMultiplierExpiration,
            // Results/Flags from this specific call
            ...responseData
        });

    } catch (error) {
        console.error('Error in /award-xp endpoint:', error);
        if (error instanceof jwt.JsonWebTokenError) {
             response.status(401).json({ error: 'Invalid token' });
        } else {
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Get user's gamification stats
gamificationRouter.get('/stats', async (request, response) => {
    try {
        const { token } = request.cookies;
        const userData = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        // Check and reset expired multiplier using the service function (ensure service is required)
        gamificationService.applyXPMultiplier(user, 0); // Just to trigger expiration check
        await user.save(); // Save potential changes to multiplier status

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
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

// Use a streak freeze
gamificationRouter.post('/use-streak-freeze', async (request, response) => {
    // This logic is simple enough to potentially keep here, or move to service if preferred
    try {
        const { token } = request.cookies;
        const userData = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        if (user.streakFreezes > 0) {
            user.streakFreezes -= 1;
            // Here, using a freeze implies maintaining the current streak,
            // The streak update logic needs to account for this if called separately.
            // For now, this just decrements the count.
            await user.save();
            response.json({
                success: true,
                streakFreezes: user.streakFreezes
            });
        } else {
            response.status(400).json({ error: 'No streak freezes available' });
        }
    } catch (error) {
        console.error('Error using streak freeze: ', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = gamificationRouter;