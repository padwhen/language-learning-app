export const calculateXPForCurrentLevel = (level: number) => {
  return Math.pow(level - 1, 2) * 100;
};

export const calculateXPForNextLevel = (level: number) => {
  return Math.pow(level, 2) * 100;
};

export const getXPProgress = (userLevel?: number, userXP?: number) => {
  const currentLevel = userLevel ?? 1;
  const currentXP = userXP ?? 0;
  const xpForCurrentLevel = calculateXPForCurrentLevel(currentLevel);
  const xpForNextLevel = calculateXPForNextLevel(currentLevel);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  
  return {
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage: Math.min(progressPercentage, 100),
    xpForNextLevel
  };
}; 