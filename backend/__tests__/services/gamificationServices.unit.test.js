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
    //--------------------------------------------------------------------------
    // 2. Testing applyXPMultiplier(user, xpAmount)
    //--------------------------------------------------------------------------
    describe('applyXPMultiplier', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = createMockUser()
        })

        it('with no active multiplier', () => {
            mockUser.xpMultiplier = 1.0
            expect(applyXPMultiplier(mockUser, 100)).toBe(100)
        })
        it('with active multiplier', () => {
            mockUser.xpMultiplier = 1.2
            mockUser.xpMultiplierExpiration = new Date(Date.now() + 1000 * 60 * 60);
            expect(applyXPMultiplier(mockUser, 100)).toBe(120)
        })
        it('should round the result to the nearest integer', () => {
            mockUser.xpMultiplier = 1.2
            mockUser.xpMultiplierExpiration = new Date(Date.now() + 1000 * 60 * 60);
            expect(applyXPMultiplier(mockUser, 11)).toBe(13) // 11 * 1.2 = 13.2
            expect(applyXPMultiplier(mockUser, 1281204)).toBe(1537445) // 1281204 * 1.2 = 1537444,8
        })
        it('should reset an expired multiplier and apply 1x', () => {
            mockUser.xpMultiplier = 2.0;
            mockUser.xpMultiplierExpiration = new Date(Date.now() - 1000 * 60 * 60);

            const awardedXp = applyXPMultiplier(mockUser, 100)
            expect(awardedXp).toBe(100)
            expect(mockUser.xpMultiplier).toBe(1.0)
            expect(mockUser.xpMultiplierExpiration).toBeNull()
        })
        it('should handle xpAmount = 0 correctly', () => {
            mockUser.xpMultiplier = 1.5
            expect(applyXPMultiplier(mockUser, 0)).toBe(0)
        })
        it('should handle numeric string xpAmount', () => {
            mockUser.xpMultiplier = 1.5
            expect(applyXPMultiplier(mockUser, "10")).toBe(15)
        })
        it('should handle when xpAmount is NaN', () => {
            mockUser.xpMultiplier = 30
            expect(applyXPMultiplier(mockUser, "abcxyz")).toBe(0)
            expect(applyXPMultiplier(mockUser, null)).toBe(0)
            expect(applyXPMultiplier(mockUser, undefined)).toBe(0)
        })
    })
})