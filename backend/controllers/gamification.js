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

// Award XP for Match Game completion and check achievements
gamificationRouter.post('/match-game-complete', async (request, response) => {
    try {
        const { token } = request.cookies;
        const userData = jwt.verify(token, JWT_SECRET);
        
        if (!userData || !userData.id) {
            return response.status(401).json({ error: 'Invalid token data' });
        }

        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        const {
            deckId,
            cardIds, // Array of card IDs that were matched
            timeElapsed, // Time in milliseconds
            mistakes, // Number of mistakes made
            completed // Whether the game was completed successfully
        } = request.body;

        if (!completed) {
            return response.status(400).json({ error: 'Game was not completed' });
        }

        console.log("--- Match Game Achievement Check Start ---");
        console.log(`User: ${user.username}, DeckId: ${deckId}, Cards: ${cardIds?.length}, Time: ${timeElapsed}ms, Mistakes: ${mistakes}`);

        // Initialize matchGameStats if it doesn't exist
        if (!user.matchGameStats) {
            user.matchGameStats = {
                gamesPlayed: 0,
                uniqueCardsMatched: [],
                flawlessGames: 0,
                gamesUnder60s: 0,
                decksPlayed: [],
                midnightGames: 0
            };
        }

        const responseData = {
            achievements: [],
            badges: [],
            xpGained: 0
        };

        // Check if it's after 10 PM (22:00)
        const now = new Date();
        const isAfter10PM = now.getHours() >= 22;

        // Update stats
        user.matchGameStats.gamesPlayed += 1;
        
        // Add unique cards to array (only if not already present)
        if (cardIds && cardIds.length > 0) {
            cardIds.forEach(cardId => {
                if (!user.matchGameStats.uniqueCardsMatched.includes(cardId)) {
                    user.matchGameStats.uniqueCardsMatched.push(cardId);
                }
            });
        }

        // Add deck to played decks (only if not already present)
        if (deckId && !user.matchGameStats.decksPlayed.includes(deckId)) {
            user.matchGameStats.decksPlayed.push(deckId);
        }

        // Check if flawless (no mistakes)
        if (mistakes === 0) {
            user.matchGameStats.flawlessGames += 1;
        }

        // Check if under 60 seconds
        if (timeElapsed < 60000) {
            user.matchGameStats.gamesUnder60s += 1;
        }

        // Check if midnight game
        if (isAfter10PM) {
            user.matchGameStats.midnightGames += 1;
        }

        // Award base XP for completing match game
        const baseXP = 10;
        const xpAwarded = gamificationService.applyXPMultiplier(user, baseXP);
        user.xp += xpAwarded;
        responseData.xpGained = xpAwarded;

        // Check for achievements
        const { achievementMap } = require('../config/achievements');

        // 1. Match Maker (First game)
        if (user.matchGameStats.gamesPlayed === 1) {
            if (!user.achievements.some(a => a.name === achievementMap.first_match_game.name)) {
                user.achievements.push({
                    name: achievementMap.first_match_game.name,
                    description: achievementMap.first_match_game.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push({
                    ...achievementMap.first_match_game,
                    tier: 'bronze' // First game is always bronze
                });
            }
        }

        // 2. Word Catcher (10 unique cards)
        if (user.matchGameStats.uniqueCardsMatched.length >= 10) {
            if (!user.achievements.some(a => a.name === achievementMap.word_catcher.name)) {
                user.achievements.push({
                    name: achievementMap.word_catcher.name,
                    description: achievementMap.word_catcher.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push(achievementMap.word_catcher);
            }
        }

        // 3. Flawless Flip (no mistakes this game)
        if (mistakes === 0) {
            if (!user.achievements.some(a => a.name === achievementMap.flawless_flip.name)) {
                user.achievements.push({
                    name: achievementMap.flawless_flip.name,
                    description: achievementMap.flawless_flip.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push(achievementMap.flawless_flip);
            }
        }

        // 4. Blink & You'll Miss It (under 60 seconds)
        if (timeElapsed < 60000) {
            if (!user.achievements.some(a => a.name === achievementMap.blink_miss.name)) {
                user.achievements.push({
                    name: achievementMap.blink_miss.name,
                    description: achievementMap.blink_miss.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push(achievementMap.blink_miss);
            }
        }

        // 5. Deck Hopper (3 different decks)
        if (user.matchGameStats.decksPlayed.length >= 3) {
            if (!user.achievements.some(a => a.name === achievementMap.deck_hopper.name)) {
                user.achievements.push({
                    name: achievementMap.deck_hopper.name,
                    description: achievementMap.deck_hopper.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push(achievementMap.deck_hopper);
            }
        }

        // 6. Midnight Matcher (after 10 PM)
        if (isAfter10PM) {
            if (!user.achievements.some(a => a.name === achievementMap.midnight_matcher.name)) {
                user.achievements.push({
                    name: achievementMap.midnight_matcher.name,
                    description: achievementMap.midnight_matcher.description,
                    dateEarned: new Date()
                });
                responseData.achievements.push(achievementMap.midnight_matcher);
            }
        }

        // Check for Match Maker tier badge
        const { matchMakerTiers } = require('../config/achievements');
        const gamesPlayed = user.matchGameStats.gamesPlayed;
        let currentTier = null;

        if (gamesPlayed >= matchMakerTiers.diamond.min) currentTier = 'Diamond';
        else if (gamesPlayed >= matchMakerTiers.gold.min) currentTier = 'Gold';
        else if (gamesPlayed >= matchMakerTiers.silver.min) currentTier = 'Silver';
        else if (gamesPlayed >= matchMakerTiers.bronze.min) currentTier = 'Bronze';

        if (currentTier) {
            const existingBadge = user.badges.find(b => b.name === 'Match Maker');
            if (!existingBadge || existingBadge.tier !== currentTier) {
                // Remove old badge if exists
                if (existingBadge) {
                    user.badges = user.badges.filter(b => b.name !== 'Match Maker');
                }
                // Add new tier badge
                user.badges.push({
                    name: 'Match Maker',
                    tier: currentTier,
                    dateEarned: new Date()
                });
                responseData.badges.push({
                    name: 'Match Maker',
                    tier: currentTier,
                    count: gamesPlayed
                });
            }
        }

        // Record XP event
        gamificationService.recordXpEvent(user._id, xpAwarded, 'match_game_complete');

        // Check for level up
        const levelUpInfo = gamificationService.checkAndApplyLevelUp(user);
        if (levelUpInfo) {
            responseData.levelUpInfo = levelUpInfo;
        }

        // Check for XP badges
        const badgeData = gamificationService.checkXpBadges(user);
        if (badgeData) {
            responseData.badges.push(...(badgeData.badges || []));
        }

        await user.save();

        console.log("Match Game Stats:", user.matchGameStats);
        console.log("Achievements earned this session:", responseData.achievements.length);
        console.log("--- Match Game Achievement Check End ---");

        response.json({
            success: true,
            xp: user.xp,
            level: user.level,
            matchGameStats: {
                gamesPlayed: user.matchGameStats.gamesPlayed,
                uniqueCardsMatched: user.matchGameStats.uniqueCardsMatched.length,
                flawlessGames: user.matchGameStats.flawlessGames,
                gamesUnder60s: user.matchGameStats.gamesUnder60s,
                decksPlayed: user.matchGameStats.decksPlayed.length,
                midnightGames: user.matchGameStats.midnightGames
            },
            ...responseData
        });

    } catch (error) {
        console.error('Error in match-game-complete endpoint:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            response.status(401).json({ error: 'Invalid token' });
        } else {
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

module.exports = gamificationRouter;