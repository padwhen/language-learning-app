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
    describe('1 -- calculateLevel', () => {
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
        it('should handle edge cases/large numbers', () => {
            expect(calculateLevel(1000)).toBe(4) // 1000/100 = 10 sqrt(10) = 3.1 + 1 = 4
            expect(calculateLevel(150000)).toBe(39)  // 150000 / 100 = 1500 sqrt(1500) = 38.7 + 1 = 39
            expect(calculateLevel(99999999999)).toBe(31623) // 99999999999/100 = 999999999.99 sqrt(999999999.99) = 31622.7 + 1 = 31623
        })
    })
    //--------------------------------------------------------------------------
    // 2. Testing applyXPMultiplier(user, xpAmount)
    //--------------------------------------------------------------------------
    describe('2 -- applyXPMultiplier', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = createMockUser()
        })

        it('should handle with no active multiplier', () => {
            mockUser.xpMultiplier = 1.0
            expect(applyXPMultiplier(mockUser, 100)).toBe(100)
        })
        it('should handle with active multiplier', () => {
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
    //--------------------------------------------------------------------------
    // 3. Testing updateStreak(user, today)
    //--------------------------------------------------------------------------
    describe('3 -- updateStreak', () => {
        let mockUser;
        let today;
        let yesterday;
        let twoDaysAgo;

        beforeEach(() => {
            mockUser = createMockUser()
            today = new Date();

            yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)

            twoDaysAgo = new Date(today)
            twoDaysAgo.setDate(today.getDate() - 2)
        })

        it('should handle first activity', () => {
            const flags = updateStreak(mockUser, today)
            expect(mockUser.currentStreak).toBe(1)
            expect(mockUser.maxStreak).toBe(1)
            expect(flags.streakStarted).toBe(true)
        })
        it('should increment streak for consecutive days', () => {
            const day1 = yesterday
            updateStreak(mockUser, day1)
            expect(mockUser.currentStreak).toBe(1)
            const day2 = today
            updateStreak(mockUser, day2)
            expect(mockUser.currentStreak).toBe(2)
            expect(mockUser.maxStreak).toBe(2)
        })
        it('should increment streak for multiple consecutive days', () => {
            // Simulate a week of activity
            const dates = [
                new Date('2025-05-07'),
                new Date('2025-05-08'),
                new Date('2025-05-09'),
                new Date('2025-05-10'),
                new Date('2025-05-11'),
                new Date('2025-05-12'),
                new Date('2025-05-13')
            ];
            dates.forEach((date, index) => {
                updateStreak(mockUser, date)
                expect(mockUser.currentStreak).toBe(index + 1)
            })
            expect(mockUser.maxStreak).toBe(7)
        })
        it('should handle same-day multiple activities', () => {
            // First activity 
            updateStreak(mockUser,today)
            expect(mockUser.currentStreak).toBe(1)
            // Second acitivity
            updateStreak(mockUser, today)
            expect(mockUser.currentStreak).toBe(1)
        })
        it('should handle timezone edge cases', () => {
            // Activity at 11:59 PM
            const day1 = new Date('2024-05-07T23:59:59')
            updateStreak(mockUser, day1);
            // Next activity at 12:01 AM next day
            const day2 = new Date('2024-05-08T00:01:00');
            updateStreak(mockUser, day2);
            expect(mockUser.currentStreak).toBe(2);
        })
        it('should break streak if login is >1 day later and no freezes', () => {
            mockUser.lastActiveDate = twoDaysAgo 
            mockUser.currentStreak = 5
            mockUser.streakFreezes = 0
            const flags = updateStreak(mockUser, today)

            expect(mockUser.currentStreak).toBe(0)
            expect(flags).toEqual({ streakBroken: true })
        })
        it('should use a streak freeze if login is >1 day later and freezes > 0', () => {
            mockUser.lastActiveDate = twoDaysAgo
            mockUser.currentStreak = 5
            mockUser.maxStreak = 5
            mockUser.streakFreezes = 1

            const flags = updateStreak(mockUser, today)

            expect(mockUser.currentStreak).toBe(5)  // Maintained
            expect(mockUser.streakFreezes).toBe(0)  // Freeze used
            expect(mockUser.maxStreak).toBe(5) // Max streak remains
            expect(flags).toEqual({ usedStreakFreeze: true })
        })
        it('should handle month/year rollovers correctly', () => {
            // Last day of month
            const lastDayOfMonth = new Date('2025-05-31T23:59:59')
            updateStreak(mockUser, lastDayOfMonth)
            // First day of next month
            const firstDayNextMonth = new Date('2025-06-01T00:01:01')
            updateStreak(mockUser, firstDayNextMonth)
            expect(mockUser.currentStreak).toBe(2)
        })
        it('should handle leap years correctly', () => {
            // February 28th
            const feb28 = new Date('2024-02-28')
            updateStreak(mockUser, feb28)
            // February 29th (leap day)
            const feb29 = new Date('2024-02-29')
            updateStreak(mockUser, feb29)
            expect(mockUser.currentStreak).toBe(2)
            // March 1st
            const mar1 = new Date('2024-03-01')
            updateStreak(mockUser, mar1)
            expect(mockUser.currentStreak).toBe(3)
        })
        it('should handle multiple streak freezes correctly', () => {
            // Day 1
            const day1 = today
            updateStreak(mockUser, day1)
            expect(mockUser.currentStreak).toBe(1)
            // Add multiple streak freezes
            mockUser.streakFreezes = 3
            // Skip to day 5 (missing 3 days)
            const day5 = new Date(day1)
            day5.setDate(day1.getDate() + 4) // Add 4 days to get to day 5
            const flags = updateStreak(mockUser, day5)
            // Should maintain streak and use one freeze
            expect(mockUser.currentStreak).toBe(1)
            expect(mockUser.streakFreezes).toBe(2)
            expect(flags.usedStreakFreeze).toBe(true)
        })
        it('should handle invalid dates gracefully', () => {
            // First valid date
            const validDate = new Date(today)
            updateStreak(mockUser, validDate)
            // Invalid date
            const invalidDate = new Date('invalid')
            updateStreak(mockUser, invalidDate)
            expect(mockUser.currentStreak).toBe(1)
        })
        it('should handle very long streaks correctly', () => {
            // Simulate a 100-day streak
            const startDate = new Date('2024-01-01')
            for (let i = 0; i < 100; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
                updateStreak(mockUser, date)
            }
            expect(mockUser.currentStreak).toBe(100)
            expect(mockUser.maxStreak).toBe(100)
        })
    })
})