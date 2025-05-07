const {
    calculateLevel,
    applyXPMultiplier,
    updateStreak,
    awardExperience,
    checkAndApplyLevelUp,
    checkAndApplyStreakRewards,
    checkActivityAchievements,
    checkXpBadges,
} = require('../../services/gamificationServices'); 

// --- Mock configuration files ---
// Jest will use these mock implementations whenever '../config/achievements'
// or '../config/badges' is required by gamificationServices.js
jest.mock('../../config/achievements', () => ({
    'daily_login': { name: 'Daily Visitor', description: 'Mocked: Log in for the first time today!' },
    'translate': { name: 'First Step', description: 'Mocked: Translate your first phrase!' },
    // Others
}), { virtual: true }); // virtual: true is useful if the file doesn't actually exist yet or for full control

jest.mock('../../config/badges', () => ([
    { xp: 100, name: 'Mock Bronze XP', tier: 'Bronze' }, // Using smaller XP for easier testing
    { xp: 500, name: 'Mock Silver XP', tier: 'Silver' },
    // Add other mock badges as needed
]), { virtual: true });

describe('Gamification Service - Unit Tests', () => {
    // --- Helper for creating mock user objects ---
    const createMockUser = (initialData = {}) => ({
        username: 'testuser',
        level: 1,
        xp: 0,
        weeklyXP: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastActiveDate: null,
        streakFreezes: 0,
        xpMultiplier: 1.0,
        xpMultiplierExpiration: null,
        achievements: [],
        badges: [],
        // If any service functions call Mongoose-specific methods on the user
        // (like .save()), mock them here, e.g.:
        // save: jest.fn().mockResolvedValue(true),
        ...initialData, 
    });



})