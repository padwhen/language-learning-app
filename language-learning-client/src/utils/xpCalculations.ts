export const calculateXPForCurrentLevel = (level: number): number => {
    return Math.pow(level - 1, 2) * 100
}

export const calculateXPForNextLevel = (level: number): number => {
    return Math.pow(level, 2) * 100
}

export interface XPProgress {
    xpInCurrentLevel: number;
    xpNeededForNextLevel: number;
    progressPercentage: number;
}

export const getXpProgress = (user: { level?: number; xp?: number} | null): XPProgress => {
    const currentLevel = user?.level ?? 1;
    const currentXP = user?.xp ?? 0
    const xpForCurrentLevel = calculateXPForCurrentLevel(currentLevel)
    const xpForNextLevel = calculateXPForNextLevel(currentLevel)
    const xpInCurrentLevel = currentXP - xpForCurrentLevel
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = (currentXP / xpNeededForNextLevel) * 100;
    
    return {
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercentage: Math.min(progressPercentage, 100)
    };
}