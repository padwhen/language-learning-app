const achievementMap = require('../config/achievements');
const badgeMilestones = require('../config/badges');

/**
 * Calculates level based on XP.
 * @param {number} xp - Total experience points.
 * @returns {number} - Calculated level.
 */
function calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Checks for expired multiplier, applies current multiplier to XP amount.
 * Modifies user object if multiplier expires.
 * @param {object} user - Mongoose user document.
 * @param {number} xpAmount - Base XP amount to potentially multiply.
 * @returns {number} - XP amount after applying multiplier.
 */
function applyXPMultiplier(user, xpAmount) {
    const now = new Date();
    if (user.xpMultiplierExpiration && now > user.xpMultiplierExpiration) {
        console.log(`XP Multiplier for user ${user.username} expired.`);
        user.xpMultiplier = 1.0;
        user.xpMultiplierExpiration = null;
    }
    const numericXpAmount = Number(xpAmount) || 0;
    const finalAmount = Math.round(numericXpAmount * user.xpMultiplier);
    if (user.xpMultiplier && user.xpMultiplier > 1.0) {
         console.log(`Applying ${user.xpMultiplier}x multiplier: ${numericXpAmount} -> ${finalAmount} XP`);
    }
    return finalAmount;
}

/**
 * Updates user's streak based on last active date.
 * Modifies user object directly (currentStreak, maxStreak, streakFreezes).
 * @param {object} user - Mongoose user document.
 * @param {Date} today - The current date object.
 * @returns {object} - Flags: { streakIncreased, streakStarted, streakBroken, usedStreakFreeze }.
 */
function updateStreak(user, today) {
    const responseFlags = {};
    let dayDifference = 0;

    if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastActiveStart = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        dayDifference = Math.round((todayStart.getTime() - lastActiveStart.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`Streak check: Today=${todayStart.toDateString()}, LastActive=${lastActiveStart.toDateString()}, Diff=${dayDifference}`);

        if (dayDifference === 1) {
            user.currentStreak += 1;
            user.maxStreak = Math.max(user.maxStreak, user.currentStreak);
            responseFlags.streakIncreased = true;
            console.log(`Streak increased to ${user.currentStreak}`);
        } else if (dayDifference > 1) {
            if (user.streakFreezes > 0) {
                user.streakFreezes -= 1;
                responseFlags.usedStreakFreeze = true;
                console.log(`Streak maintained using freeze. Freezes left: ${user.streakFreezes}`);
            } else {
                user.currentStreak = 0;
                responseFlags.streakBroken = true;
                console.log("Streak broken.");
            }
        } else if (dayDifference === 0) {
             console.log("Streak unchanged (same day activity).");
             responseFlags.streakUnchanged = true; // Add flag for same day
        } else {
             console.log(`Unexpected dayDifference: ${dayDifference}. Streak logic may need review.`);
        }
    } else {
        user.currentStreak = 1;
        user.maxStreak = 1;
        responseFlags.streakStarted = true;
        console.log("Streak started.");
    }
    return responseFlags;
}

/**
 * Checks if daily login XP was already awarded today and awards XP conditionally.
 * Modifies user object (xp, weeklyXP).
 * @param {object} user - Mongoose user document.
 * @param {number} xpAmount - Base XP amount for the activity.
 * @param {string} activity - Type of activity (e.g., 'daily_login').
 * @param {Date} today - The current date object.
 * @returns {{xpAwarded: number, alreadyAwardedDailyLoginToday: boolean}} - XP awarded in this call & flag.
 */
function awardExperience(user, xpAmount, activity, today) {
    let alreadyAwardedDailyLoginToday = false;
    if (activity === 'daily_login' && user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        if (lastActive.toDateString() === today.toDateString()) {
            alreadyAwardedDailyLoginToday = true;
            console.log("Daily login XP already awarded today.");
        }
    }

    let adjustedXpGained = 0;
    if (activity !== 'daily_login' || !alreadyAwardedDailyLoginToday) {
        adjustedXp = applyXPMultiplier(user, xpAmount);
        if (adjustedXp > 0) {
            user.xp += adjustedXp;
            user.weeklyXP += adjustedXp;
            adjustedXpGained = adjustedXp;
            console.log(`Awarded ${adjustedXpGained} XP for activity: ${activity}`);
        }
    }
    return { xpAwarded: adjustedXpGained, alreadyAwardedDailyLoginToday };
}

/**
 * Checks for level up, applies rewards (e.g., streak freezes).
 * Modifies user object directly (level, streakFreezes).
 * @param {object} user - Mongoose user document.
 * @returns {object|null} - Info about level up or null if no level up.
 */
function checkAndApplyLevelUp(user) {
    const originalLevel = user.level;
    const newLevel = calculateLevel(user.xp);

    if (newLevel > originalLevel) {
        const levelsGained = newLevel - originalLevel;
        user.level = newLevel;
        console.log(`User leveled up to ${newLevel} (+${levelsGained} levels)`);

        let freezesAwarded = 0;
        for (let lvl = originalLevel + 1; lvl <= newLevel; lvl++) {
            if (lvl <= 10) { // Award freeze for each level up to 10
                freezesAwarded++;
            }
            // Add other level-specific rewards here (e.g., based on `lvl`)
        }
        if (freezesAwarded > 0) {
            user.streakFreezes += freezesAwarded;
            console.log(`Awarded ${freezesAwarded} streak freeze(s) for level up.`);
        }
        return { leveledUp: true, newLevel, levelsGained, freezesAwarded };
    }
    return null; // No level up
}

/**
  * Checks for streak milestones and applies rewards if the milestone was *just* reached.
  * Modifies user object directly (xp, weeklyXP, xpMultiplier, achievements, etc.).
  * @param {object} user - Mongoose user document.
  * @param {boolean} streakIncreased - Flag indicating if streak increased in this call.
  * @param {Date} today - The current date object.
  * @returns {object|null} - Object describing the reward or null.
  */
function checkAndApplyStreakRewards(user, streakIncreased, today) {
    let streakRewardData = null;

    if (!streakIncreased) {
        return null; // Only award on the day the streak increases
    }

    if (user.currentStreak === 3) {
        const bonusXp = applyXPMultiplier(user, 50); // Apply multiplier here too
        user.xp += bonusXp;
        user.weeklyXP += bonusXp;
        streakRewardData = { streakReward: { type: 'xp_boost', amount: bonusXp } };
        console.log(`Awarded ${bonusXp} bonus XP for 3-day streak.`);
    } else if (user.currentStreak === 7) {
        user.xpMultiplier = 1.2;
        user.xpMultiplierExpiration = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Expires in 24h
        user.streakFreezes += 1; // Award freeze too
        streakRewardData = {
            streakReward: {
                type: 'xp_multiplier',
                multiplier: 1.2,
                expires: user.xpMultiplierExpiration,
                extra: { type: 'streak_freeze', amount: 1 }
            }
        };
        console.log("Awarded 1.2x XP multiplier and 1 freeze for 7-day streak.");
    } else if (user.currentStreak === 30) {
        const achievementName = '30-Day Streak';
        if (!user.achievements.some(a => a.name === achievementName)) {
            user.achievements.push({
                name: achievementName,
                description: 'Maintained a 30-day streak'
            });
            streakRewardData = { streakReward: { type: 'achievement', name: achievementName } };
            console.log("Awarded 30-Day Streak achievement.");
        }
    }
    // Add checks for other milestones (e.g., 14 days, 60 days) here...

    return streakRewardData;
}

/**
 * Checks for and grants activity-specific achievements if not already earned.
 * Modifies user object directly (achievements).
 * @param {object} user - Mongoose user document.
 * @param {string} activity - The type of activity performed.
 * @param {boolean} alreadyAwardedDailyLoginToday - Flag from XP check.
 * @returns {object|null} - Achievement awarded or null.
 */
function checkActivityAchievements(user, activity, alreadyAwardedDailyLoginToday) {
    let awardedAchievement = null;
    if (achievementMap[activity]) {
        const achievement = achievementMap[activity];
        const alreadyHas = user.achievements.some(a => a.name === achievement.name);

        if (!alreadyHas) {
            // Special condition for 'Daily Visitor'
            if (achievement.name === 'Daily Visitor') {
                if (!alreadyAwardedDailyLoginToday) { // Only award if it's the first login today
                    user.achievements.push({ name: achievement.name, description: achievement.description });
                    awardedAchievement = achievement;
                    console.log(`Awarded achievement: ${achievement.name}`);
                }
            } else {
                // Award other achievements if not already present
                user.achievements.push({ name: achievement.name, description: achievement.description });
                awardedAchievement = achievement;
                console.log(`Awarded achievement: ${achievement.name}`);
            }
        }
    }
    return awardedAchievement ? { achievementAwarded: awardedAchievement } : null;
}

/**
 * Checks for and grants XP milestone badges if not already earned.
 * Modifies user object directly (badges).
 * @param {object} user - Mongoose user document.
 * @returns {object|null} - Badge awarded or null.
 */
function checkXpBadges(user) {

    let awardedBadge = null;
    badgeMilestones.forEach(milestone => {
        if (user.xp >= milestone.xp && !user.badges.some(b => b.name === milestone.name)) {
            const newBadge = { name: milestone.name, tier: milestone.tier };
            user.badges.push(newBadge);
            awardedBadge = newBadge; // Keep track if any badge was awarded in this call
            console.log(`Awarded badge: ${newBadge.name}`);
        }
    });
    return awardedBadge ? { badgeAwarded: awardedBadge } : null;
}


module.exports = {
    calculateLevel,
    applyXPMultiplier,
    updateStreak,
    awardExperience,
    checkAndApplyLevelUp,
    checkAndApplyStreakRewards,
    checkActivityAchievements,
    checkXpBadges,
};