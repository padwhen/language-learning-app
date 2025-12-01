import achievementAnimation from '@/assets/lottie/achievement.json';
import sharkAnimation from '@/assets/lottie/shark.json';
import catAnimation from '@/assets/lottie/Cat_scratches.json';
import cookingEggAnimation from '@/assets/lottie/Cooking_egg.json';
import winkAnimation from '@/assets/lottie/wink.json';
import rabbitAnimation from '@/assets/lottie/Rabbit.json';
import owlAnimation from '@/assets/lottie/owl.json';

export const lottieMap = {
  'shark.json': sharkAnimation,
  'Cat_scratches.json': catAnimation,
  'Cooking_egg.json': cookingEggAnimation,
  'wink.json': winkAnimation,
  'Rabbit.json': rabbitAnimation,
  'owl.json': owlAnimation,
  'default': achievementAnimation
};

export type RegularAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  lottieFile: string;
  comingSoon?: false;
};

export type ComingSoonAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  comingSoon: true;
  lottieFile?: never;
};

export type Achievement = RegularAchievement | ComingSoonAchievement;

export const allAchievements: Achievement[] = [
  {
    id: 'match_maker',
    name: 'Match Maker',
    description: 'Complete your first matching game',
    icon: '🦈',
    lottieFile: 'shark.json'
  },
  {
    id: 'word_catcher', 
    name: 'Word Catcher',
    description: 'Match 10 unique vocabulary cards',
    icon: '🐱',
    lottieFile: 'Cat_scratches.json'
  },
  {
    id: 'flawless_flip',
    name: 'Flawless Flip', 
    description: 'Win a match without mistakes',
    icon: '🍳',
    lottieFile: 'Cooking_egg.json'
  },
  {
    id: 'blink_miss',
    name: "Blink & You'll Miss It",
    description: 'Complete a match under 60 seconds',
    icon: '😉',
    lottieFile: 'wink.json'
  },
  {
    id: 'deck_hopper',
    name: 'Deck Hopper',
    description: 'Complete matching games on 3 different decks',
    icon: '🐰',
    lottieFile: 'Rabbit.json'
  },
  {
    id: 'midnight_matcher',
    name: 'Midnight Matcher',
    description: 'Play a matching game after 10 PM',
    icon: '🦉',
    lottieFile: 'owl.json'
  },
  // Add empty slots to fill 4x4 grid
  ...Array(10).fill(null).map((_, i): ComingSoonAchievement => ({
    id: `coming_soon_${i}`,
    name: 'Coming Soon',
    description: 'More achievements coming soon!',
    icon: '❓',
    comingSoon: true
  }))
]; 