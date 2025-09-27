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
    'quiz_complete': { name: 'Quiz Champion', description: 'Mocked: Complete a quiz'}
    // Others
}), { virtual: true }); // virtual: true is useful if the file doesn't actually exist yet or for full control

jest.mock('../../config/badges', () => ([
    { xp: 100, name: 'Mock Bronze XP', tier: 'Bronze' }, // Using smaller XP for easier testing
    { xp: 500, name: 'Mock Silver XP', tier: 'Silver' },
    { xp: 1000, name: 'Mock Gold XP', tier: 'Gold' },
    { xp: 5000, name: 'Mock Platinum XP', tier: 'Platinum' },
    // Add other mock badges as needed
]), { virtual: true });

// Mock XpHistory model to prevent database validation errors
jest.mock('../../models/XpHistory', () => ({
    create: jest.fn().mockResolvedValue({}),
}), { virtual: true });

describe('Gamification Service - Unit Tests', () => {
    // --- Helper for creating mock user objects ---
    const createMockUser = (initialData = {}) => ({
        _id: '507f1f77bcf86cd799439011', // Mock ObjectId
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
        loginDates: [],
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
    //--------------------------------------------------------------------------
    // 4. Testing awardExperience(user, xpAmount, activity, today)
    //--------------------------------------------------------------------------
    describe('4 -- awardExperience', () => {
        let mockUser;
        let today;
        let xpAmount;

        beforeEach(() => {
            mockUser = createMockUser()
            today = new Date()
            xpAmount = 50
        })
        it('should award XP for first daily login of the day', () => {
            const flags = awardExperience(mockUser, xpAmount, 'daily_login', today)
            expect(flags.xpAwarded).toBe(50)
            expect(flags.alreadyAwardedDailyLoginToday).toBe(false)
            expect(mockUser.xp).toBe(50)
            expect(mockUser.weeklyXP).toBe(50)
        })
        it('should record login date for daily login activity', () => {
            const flags = awardExperience(mockUser, xpAmount, 'daily_login', today)
            expect(flags.xpAwarded).toBe(50)
            expect(mockUser.loginDates).toHaveLength(1)
            expect(mockUser.loginDates[0].date).toEqual(today)
            expect(mockUser.loginDates[0].month).toBe(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
            expect(mockUser.loginDates[0].year).toBe(today.getFullYear())
        })
        it('should not record duplicate login dates for same day', () => {
            // First daily login
            awardExperience(mockUser, xpAmount, 'daily_login', today)
            expect(mockUser.loginDates).toHaveLength(1)
            
            // Second daily login same day (should not add another entry)
            const secondToday = new Date(today)
            secondToday.setHours(14, 0, 0, 0) // Different time, same day
            awardExperience(mockUser, xpAmount, 'daily_login', secondToday)
            expect(mockUser.loginDates).toHaveLength(1) // Should still be 1
        })
        it('should not record login date for non-daily-login activities', () => {
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(50)
            expect(mockUser.loginDates).toHaveLength(0) // Should not record login date
        })
        it('should not award XP for subsequent daily logins on same day', () => {
            today.setHours(0, 0, 0, 0);
            // First login
            const firstResult = awardExperience(mockUser, xpAmount, 'daily_login', today);
            expect(firstResult.xpAwarded).toBe(50);
            expect(firstResult.alreadyAwardedDailyLoginToday).toBe(false);
            
            mockUser.lastActiveDate = new Date(today);
            // Set time to later in the same day
            today.setHours(14, 0, 0, 0); // Set to 2:00 PM same day
            // Second login
            const secondResult = awardExperience(mockUser, xpAmount, 'daily_login', today);
            // Assertions
            expect(secondResult.xpAwarded).toBe(0);
            expect(secondResult.alreadyAwardedDailyLoginToday).toBe(true);
            expect(mockUser.xp).toBe(50); // Should still be 50 from first login
            expect(mockUser.weeklyXP).toBe(50);
        })
        it('should award XP for non-daily login activities', () => {
            xpAmount = 100;
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(100)
            expect(flags.alreadyAwardedDailyLoginToday).toBe(false)
            expect(mockUser.xp).toBe(100)
            expect(mockUser.weeklyXP).toBe(100)
        })
        it('should apply XP multiplier when available', () => {
            mockUser.xpMultiplier = 1.5;
            mockUser.xpMultiplierExpiration = new Date(today.getTime() + 3600000); // 1 hour from now
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today);
            expect(flags.xpAwarded).toBe(75); // 50 * 1.5 = 75
            expect(mockUser.xp).toBe(75);
            expect(mockUser.weeklyXP).toBe(75);
        })
        it('should not apply expired XP multiplier', () => {
            mockUser.xpMultiplier = 2.0
            mockUser.xpMultiplierExpiration = new Date(today.getTime() - 3600000); // 1 hour ago
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(50)
            expect(mockUser.xpMultiplier).toBe(1.0)
            expect(mockUser.xpMultiplierExpiration).toBeNull()
        })
        it('should handle zero XP amount correctly', () => {
            xpAmount = 0
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(0)
            expect(mockUser.xp).toBe(0)
            expect(mockUser.weeklyXP).toBe(0)
        })
        it('should handle negative XP amount gracefully', () => {
            xpAmount = -50
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(0)
            expect(mockUser.xp).toBe(0)
            expect(mockUser.weeklyXP).toBe(0)
        })
        it('should handle invalid activity type gracefully', () => {
            xpAmount = 100
            const flags = awardExperience(mockUser, xpAmount, 'invalid_activity', today)
            expect(flags.xpAwarded).toBe(100)
            expect(mockUser.xp).toBe(100)
            expect(mockUser.weeklyXP).toBe(100)
        })
        it('should handle null/undefined parameters gracefully', () => {
            // Test null xpAmount
            const flag1 = awardExperience(mockUser, null, 'quiz_complete', today)
            expect(flag1.xpAwarded).toBe(0)
            // Test undefined activity
            const flag2 = awardExperience(mockUser, 100, undefined, today)
            expect(flag2.xpAwarded).toBe(100)
            // Test null today
            const flag3 = awardExperience(mockUser, 100, 'quiz_complete', null)
            expect(flag3.xpAwarded).toBe(100)
        })
        it('should handle string XP amount correctly', () => {
            const flags = awardExperience(mockUser, '100', 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(100)
            expect(mockUser.xp).toBe(100)
            expect(mockUser.weeklyXP).toBe(100)
        })
        it('should handle multiple different activities in same day', () => {
            const flag1 = awardExperience(mockUser, 50, 'daily_login', today)
            const flag2 = awardExperience(mockUser, 100, 'quiz_complete', today)
            const flag3 = awardExperience(mockUser, 75, 'translation', today)   

            expect(flag1.xpAwarded).toBe(50)
            expect(flag2.xpAwarded).toBe(100)
            expect(flag3.xpAwarded).toBe(75)
            expect(mockUser.xp).toBe(225)
            expect(mockUser.weeklyXP).toBe(225)
        })
        it('should handle very large XP amounts correctly', () => {
            const xpAmount = 9999999999999
            const flags = awardExperience(mockUser, xpAmount, 'quiz_complete', today)
            expect(flags.xpAwarded).toBe(9999999999999)
            expect(mockUser.xp).toBe(9999999999999)
            expect(mockUser.weeklyXP).toBe(9999999999999)
        })
    })
    //--------------------------------------------------------------------------
    // 5. Testing checkAndApplyLevelUp(user)
    //--------------------------------------------------------------------------
    describe('5 -- checkAndApplyLevelUp', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = createMockUser({
                level: 1,
                xp: 0,
                streakFreezes: 0
            });
        });

        it('should not level up when XP is insufficient', () => {
            mockUser.xp = 99; // Not enough for level 2
            const flags = checkAndApplyLevelUp(mockUser)

            expect(flags).toBeNull()
            expect(mockUser.level).toBe(1)
            expect(mockUser.streakFreezes).toBe(0)
        })
        it('should level up once and award freeze when XP reaches next level threshold', () => {
            mockUser.xp = 100; // Exactly enough for level 2
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toEqual({
                freezesAwarded: 1,
                leveledUp: true,
                levelsGained: 1,
                newLevel: 2
            })
            expect(mockUser.level).toBe(2)
            expect(mockUser.streakFreezes).toBe(1)
        })
        it('should handle multiple level ups and award correct number of freezes', () => {
            mockUser.xp = 400
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toEqual({ 
                leveledUp: true,
                newLevel: 3,
                levelsGained: 2, 
                freezesAwarded: 2
            })
            expect(mockUser.level).toBe(3)
            expect(mockUser.streakFreezes).toBe(2)
        })
        it('should not award freezes for levels above 10', () => {
            mockUser.level = 9
            mockUser.xp = 12100
            const flags = checkAndApplyLevelUp(mockUser)

            expect(flags).toEqual({
                leveledUp: true,
                newLevel: 12,
                levelsGained: 3,
                freezesAwarded: 1
            })
            expect(mockUser.level).toBe(12)
            expect(mockUser.streakFreezes).toBe(1)
        })
        it('should handle edge case at level 10 exactly', () => {
            mockUser.level = 9;
            mockUser.xp = 8100
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toEqual({
                leveledUp: true,
                newLevel: 10,
                levelsGained: 1,
                freezesAwarded: 1
            })
            expect(mockUser.level).toBe(10)
            expect(mockUser.streakFreezes).toBe(1)
        })
        it('should handle very high levels correctly', () => {
            mockUser.level = 99
            mockUser.xp = 1000000
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toEqual({
                leveledUp: true,
                newLevel: 101,
                levelsGained: 2,
                freezesAwarded: 0
            })
            expect(mockUser.level).toBe(101)
            expect(mockUser.streakFreezes).toBe(0)
        })
        it('should handle zero XP correctly', () => {
            mockUser.xp = 0
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toBeNull()
            expect(mockUser.level).toBe(1)
            expect(mockUser.streakFreezes).toBe(0)
        })
        it('should handle negative XP gracefully', () => {
            mockUser.xp = -100
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toBeNull()
            expect(mockUser.level).toBe(1)
            expect(mockUser.streakFreezes).toBe(0)
        })
        it('should preserve existing streak freezes when leveling up', () => {
            mockUser.streakFreezes = 2
            mockUser.xp = 100
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags.freezesAwarded).toBe(1)
            expect(mockUser.streakFreezes).toBe(3)
        })
        it('should handle maximum level boundary correctly', () => {
            mockUser.level = Number.MAX_SAFE_INTEGER
            mockUser.xp = Number.MAX_SAFE_INTEGER
            const flags = checkAndApplyLevelUp(mockUser)
            expect(mockUser.level).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER)
        })
        it('should handle decimal XP values correctly', () => {
            mockUser.xp = 99.9
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags).toBeNull()
            expect(mockUser.level).toBe(1)
        })
        it('should handle string XP values correctly', () => {
            mockUser.xp = "100"
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags.newLevel).toBe(2)
            expect(mockUser.level).toBe(2)
        })
        it('should handle level 0 correctly', () => {
            mockUser.level = 0
            mockUser.xp = 100;
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags.newLevel).toBe(2)
            expect(mockUser.level).toBe(2)
        })
        it('should handle multiple level ups with existing freezes correctly', () => {
            mockUser.streakFreezes = 1
            mockUser.xp = 400
            const flags = checkAndApplyLevelUp(mockUser)
            expect(flags.freezesAwarded).toBe(2)
            expect(mockUser.streakFreezes).toBe(3)
        })
    })
    //--------------------------------------------------------------------------
    // 6. Testing checkAndApplyStreakRewards(user, streakIncreased, today)
    //--------------------------------------------------------------------------
    describe('6 -- checkAndApplyStreakRewards', () => {
        let mockUser;
        let today;

        beforeEach(() => {
            mockUser = createMockUser()
            today = new Date()
        })

        it('should return null when streakIncreased is false', () => {
            mockUser.currentStreak = 3
            mockUser.xp = 100
            const flags = checkAndApplyStreakRewards(mockUser, false, today)
            expect(flags).toBeNull()
            expect(mockUser.xp).toBe(100)
            expect(mockUser.xpMultiplier).toBe(1.0)
        })
        it('should apply 3-day streak reward when streak hits 3', () => {
            mockUser.currentStreak = 3
            mockUser.xp = 100
            const flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toEqual({
                streakReward: {
                    type: 'xp_boost',
                    amount: 50
                }
            })
            expect(mockUser.xp).toBe(150)
            expect(mockUser.weeklyXP).toBe(50)
        })
        it('should apply 7-day streak reward when streak hits 7', () => {
            mockUser.currentStreak = 7
            const flags = checkAndApplyStreakRewards(mockUser, true, today) 
            expect(flags).toEqual({
                streakReward: {
                    type: 'xp_multiplier', 
                    multiplier: 1.2,
                    expires: expect.any(Date),
                    extra: {
                        type: 'streak_freeze',
                        amount: 1
                    }
                }
            })

            expect(mockUser.xpMultiplier).toBe(1.2)
            expect(mockUser.xpMultiplierExpiration).toBeInstanceOf(Date)
            expect(mockUser.streakFreezes).toBe(1)

            const expectedExpiration = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            expect(mockUser.xpMultiplierExpiration.getTime()).toBe(expectedExpiration.getTime());
        })
        it('should award 30-day streak achievement when streak hits 30', () => {
            mockUser.currentStreak = 30
            const flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toEqual({ 
                streakReward: {
                    type: 'achievement',
                    name: '30-Day Streak'
                }
            })
            expect(mockUser.achievements).toEqual([
                {
                    name: '30-Day Streak',
                    description: 'Maintained a 30-day streak'
                }
            ]);
        })
        it('should not award achievement if already achieved', () => {
            mockUser.achievements.push({
                name: '30-Day Streak', 
                description: 'Maintained a 30-day streak'
            })
            mockUser.currentStreak = 30
            const flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toBeNull()
            expect(mockUser.achievements).toHaveLength(1)
        })
        it('should not award rewards when already at milestone', () => {
            mockUser.currentStreak = 7
            const flags = checkAndApplyStreakRewards(mockUser, false, today)
            expect(flags).toBeNull()
            expect(mockUser.xpMultiplier).toBe(1.0)
            expect(mockUser.streakFreezes).toBe(0)
        })
        it('should handle multiple streak milestones in sequence', () => {
            // Test going from 2 to 3 days
            mockUser.currentStreak = 2
            let flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toBeNull()

            // Test going from 3 to 4 days
            mockUser.currentStreak = 3
            flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toEqual({
                streakReward: {
                    type: 'xp_boost',
                    amount: 50
                }
            })

            // Test going from 6 to 7 days
            mockUser.currentStreak = 7
            flags = checkAndApplyStreakRewards(mockUser, true, today)
            expect(flags).toEqual({
                streakReward: {
                    type: 'xp_multiplier',
                    multiplier: 1.2,
                    expires: expect.any(Date),
                    extra: { type: 'streak_freeze', amount: 1 }
                }
            })
        })
        it('should handle existing XP multiplier when awarding new one', () => {
            mockUser.xpMultiplier = 1.5;
            mockUser.xpMultiplierExpiration = new Date(today.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
            
            mockUser.currentStreak = 7;
            const flags = checkAndApplyStreakRewards(mockUser, true, today);
            
            expect(mockUser.xpMultiplier).toBe(1.2);
            expect(mockUser.xpMultiplierExpiration.getTime()).toBe(
                new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime()
            );
        })
        it('should handle multiple streak freezes accumulation', () => {
            mockUser.currentStreak = 7;
            let flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(mockUser.streakFreezes).toBe(1);
            mockUser.currentStreak = 0;
            mockUser.currentStreak = 7;
            flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(mockUser.streakFreezes).toBe(1);
        });
        it('should handle invalid streak values', () => {
            mockUser.xp = 100
            mockUser.currentStreak = -1;
            const flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(flags).toBeNull();
            expect(mockUser.xp).toBe(100); 
            expect(mockUser.xpMultiplier).toBe(1.0);
        });
    
        it('should handle very long streaks', () => {
            mockUser.currentStreak = 31;
            const flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(flags).toBeNull(); 
            expect(mockUser.achievements).toHaveLength(0); 
        })
        it('should handle multiple achievements in user history', () => {
            mockUser.achievements = [
                { name: 'First Login', description: 'Logged in for the first time' },
                { name: '30-Day Streak', description: 'Maintained a 30-day streak' }
            ];
            mockUser.currentStreak = 30;
            const flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(flags).toBeNull(); 
            expect(mockUser.achievements).toHaveLength(2);
        });
        it('should handle timezone edge cases for multiplier expiration', () => {
            const endOfDay = new Date('2024-03-20T23:59:59.999Z');
            mockUser.currentStreak = 7;
            const flags = checkAndApplyStreakRewards(mockUser, true, endOfDay);
            const expectedExpiration = new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000);
            expect(mockUser.xpMultiplierExpiration.getTime()).toBe(expectedExpiration.getTime());
        })
        it('should handle concurrent streak rewards', () => {
            mockUser.currentStreak = 3;
            const flag1 = checkAndApplyStreakRewards(mockUser, true, today);
            expect(flag1).toEqual({
                streakReward: {
                    amount: 50,
                    type: 'xp_boost'
                }
            })
            const flag2 = checkAndApplyStreakRewards(mockUser, true, today);
            expect(flag2).toBeNull(); 
        });
        it('should not award duplicate streak rewards when reaching same milestone after streak break', () => {
            // First time reaching 7 days
            mockUser.currentStreak = 7;
            let flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(mockUser.streakFreezes).toBe(1);
            expect(flags).not.toBeNull();
            
            // Simulate streak break and rebuild
            mockUser.currentStreak = 0;
            mockUser.lastStreakRewardDate = null;  // Reset reward tracking
            mockUser.lastStreakRewardLevel = null;
            
            // Simulate building streak back up to 7 days
            // Note: In real scenario, this would happen over 7 days
            mockUser.currentStreak = 7;
            flags = checkAndApplyStreakRewards(mockUser, true, today);
            
            // Should get reward again because it's a new streak progression
            expect(mockUser.streakFreezes).toBe(2);
            expect(flags).not.toBeNull();
        });
        it('should not award duplicate streak rewards on same day', () => {
            // First time reaching 7 days
            mockUser.currentStreak = 7;
            let flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(mockUser.streakFreezes).toBe(1);
            expect(flags).not.toBeNull();
            
            // Try to get reward again on same day
            flags = checkAndApplyStreakRewards(mockUser, true, today);
            expect(mockUser.streakFreezes).toBe(1);  // Should not increase
            expect(flags).toBeNull();  // Should not get reward
        });
    })
    //--------------------------------------------------------------------------
    // 7. Testing checkActivityAchievements(user, activity, alreadyAwardedDailyLoginToday)
    //--------------------------------------------------------------------------
    describe('7 -- checkActivityAchievements', () => {
        let mockUser;
        const today = new Date()

        beforeEach(() => {
            mockUser = {
                achievements: []
            }
        })

        it('should award new achievement for valid activity', () => {
            const flags = checkActivityAchievements(mockUser, 'translate', false)
            expect(flags).toEqual({ 
                achievementAwarded: {
                    name: 'First Step',
                    description: 'Mocked: Translate your first phrase!'
                }
            })
            expect(mockUser.achievements).toHaveLength(1)
            expect(mockUser.achievements[0]).toEqual({ 
                name: 'First Step',
                description: 'Mocked: Translate your first phrase!'
            })
        })
        it('should not award duplicate achievements', () => {
            checkActivityAchievements(mockUser, 'translate', false)
            const initialLength = mockUser.achievements.length

            const flags = checkActivityAchievements(mockUser, 'translate', false)
            expect(flags).toBeNull()
            expect(mockUser.achievements).toHaveLength(initialLength)
        })
        it('should award Daily Visitor achievement only on first login of day', () => {
            const result1 = checkActivityAchievements(mockUser, 'daily_login', false)
            expect(result1).toEqual({
                achievementAwarded: {
                    name: 'Daily Visitor', 
                    description: 'Mocked: Log in for the first time today!'
                }
            })
            expect(mockUser.achievements).toHaveLength(1)
            // Try to award again on the same day
            const result2 = checkActivityAchievements(mockUser, 'daily_login', true)
            expect(result2).toBeNull()
            expect(mockUser.achievements).toHaveLength(1)
        })
        it('should not award Daily Visitor if already owned', () => {
            mockUser.achievements.push({
                name: 'Daily Visitor', 
                description: 'Mocked: Log in for the first time today!'
            })
            const flags = checkActivityAchievements(mockUser, 'daily_login', false)
            expect(flags).toBe(null)
            expect(mockUser.achievements).toHaveLength(1)
        })
        it('should return null for invalid activity', () => {
            const flags = checkActivityAchievements(mockUser, 'invalid_activity', false)
            expect(flags).toBeNull()
            expect(mockUser.achievements).toHaveLength(0)
        })
        it('should handle multiple different achievements', () => {
            // Award first achievement
            checkActivityAchievements(mockUser, 'translate', false);
            
            // Award second achievement
            const result = checkActivityAchievements(mockUser, 'quiz_complete', false);
            
            expect(result).toEqual({
                achievementAwarded: {
                    name: 'Quiz Champion',
                    description: 'Mocked: Complete a quiz'
                }
            });
            expect(mockUser.achievements).toHaveLength(2);
            expect(mockUser.achievements).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'First Step' }),
                    expect.objectContaining({ name: 'Quiz Champion' })
                ])
            );
        })
    })
    //--------------------------------------------------------------------------
    // 8. Testing checkXpBadges(user)
    //--------------------------------------------------------------------------
    describe('8 -- checkXpBadges', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = {
                xp: 0,
                badges: []
            }
        })
        it('should award badge when XP crosses milestone', () => {
            mockUser.xp = 100
            const flags = checkXpBadges(mockUser)
            expect(flags).toEqual({
                badgeAwarded: {
                    name: 'Mock Bronze XP',
                    tier: 'Bronze'
                }
            })
            expect(mockUser.badges).toHaveLength(1)
            expect(mockUser.badges[0]).toEqual({
                name: 'Mock Bronze XP', 
                tier: 'Bronze'
            })
        })
        it('should not award badge when XP is below milestone', () => {
            mockUser.xp = 99
            const flags = checkXpBadges(mockUser)
            expect(flags).toBeNull()
            expect(mockUser.badges).toHaveLength(0)
        })
        it('should not award duplicate badges', () => {
            mockUser.xp = 100
            checkXpBadges(mockUser)
            const initialLength = mockUser.badges.length

            const flags = checkXpBadges(mockUser)
            expect(flags).toBeNull()
            expect(mockUser.badges).toHaveLength(initialLength)
        })
        it('should award multiple badges when crossing multiple milestones', () => {
            // Set XP above Silver milestone
            mockUser.xp = 501 
            const flags = checkXpBadges(mockUser)
            expect(mockUser.badges).toHaveLength(2)
            expect(mockUser.badges).toEqual(
                expect.arrayContaining([                
                    expect.objectContaining({ name: 'Mock Bronze XP', tier: 'Bronze' }),
                    expect.objectContaining({ name: 'Mock Silver XP', tier: 'Silver' })
                ])
            )
            // Result should contain the highest tier badge awarded
            expect(flags).toEqual({
                badgeAwarded: {
                    name: 'Mock Silver XP',
                    tier: 'Silver'
                }
            });
        })
        it('should award all badges up to current XP level', () => {
            mockUser.xp = 99999
            const flags = checkXpBadges(mockUser)
            expect(mockUser.badges).toHaveLength(4)
            expect(mockUser.badges).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'Mock Bronze XP', tier: 'Bronze' }),
                    expect.objectContaining({ name: 'Mock Silver XP', tier: 'Silver' }),
                    expect.objectContaining({ name: 'Mock Gold XP', tier: 'Gold' }),
                    expect.objectContaining({ name: 'Mock Platinum XP', tier: 'Platinum' })
                ])
            )
            expect(flags).toEqual({
                badgeAwarded: {
                    name: 'Mock Platinum XP',
                    tier: 'Platinum'
                }
            })
        })
        it('should handle edge case at exact milestone XP', () => {
            mockUser.xp = 1000
            const flags = checkXpBadges(mockUser)
            expect(flags).toEqual({
                badgeAwarded: {
                    name: 'Mock Gold XP', 
                    tier: 'Gold'
                }
            })
            expect(mockUser.badges).toHaveLength(3)
        })
        it('should maintain existing badges when checking for new ones', () => {
            mockUser.badges.push({
                name: 'Mock Bronze XP', 
                tier: 'Bronze'
            })
            mockUser.xp = 500
            const flags = checkXpBadges(mockUser)
            expect(mockUser.badges).toHaveLength(2)
            expect(mockUser.badges).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'Mock Bronze XP', tier: 'Bronze' }),
                    expect.objectContaining({ name: 'Mock Silver XP', tier: 'Silver' })
                ])
            )
        })
    })
})