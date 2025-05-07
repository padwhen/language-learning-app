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
    //--------------------------------------------------------------------------
    // 1. Testing calculateLevel(xp)
    //--------------------------------------------------------------------------
    describe('calculateLevel', () => {
        it('should return level 1 for 0 XP', () => {
            expect(calculateLevel(0)).toBe(1)
        })
        it('should return level 1 for XP less than 100 (e.g., 99XP)', () => {
            expect(calculateLevel(99)).toBe(1)
        })
        it('should return level 2 for 100XP', () => {
            expect(calculateLevel(100)).toBe(2)
        })
        it('should return level 2 for 399xp, but level3 for 400xp', () => {
            expect(calculateLevel(399)).toBe(2)
            expect(calculateLevel(400)).toBe(3)
        })
        it('edge cases/large numbers', () => {
            expect(calculateLevel(1000)).toBe(4) // 1000/100 = 10 sqrt(10) = 3.1 + 1 = 4
            expect(calculateLevel(150000)).toBe(39)  // 150000 / 100 = 1500 sqrt(1500) = 38.7 + 1 = 39
            expect(calculateLevel(99999999999)).toBe(31623) // 99999999999/100 = 999999999.99 sqrt(999999999.99) = 31622.7 + 1 = 31623
        })
    })
    
})