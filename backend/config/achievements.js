const achievementMap = {
    'translate': { 
        name: 'First Step', 
        description: 'Translate your first phrase!' 
    },
    'quiz_complete': { 
        name: 'Quiz Champion', 
        description: 'Complete a quiz' 
    },
    'daily_login': { 
        name: 'Daily Visitor', 
        description: 'Log in for the first time today!' 
    },
    // Match Game Achievements
    'first_match_game': {
        name: 'Match Maker',
        description: 'Complete your first matching game!',
        lottieFile: 'shark.json'
    },
    'word_catcher': {
        name: 'Word Catcher',
        description: 'Match 10 unique vocabulary cards!',
        lottieFile: 'Cat_scratches.json'
    },
    'flawless_flip': {
        name: 'Flawless Flip',
        description: 'Win a match without mistakes!',
        lottieFile: 'Cooking_egg.json'
    },
    'blink_miss': {
        name: "Blink & You'll Miss It",
        description: 'Complete a match under 60 seconds!',
        lottieFile: 'wink.json'
    },
    'deck_hopper': {
        name: 'Deck Hopper',
        description: 'Complete matching games on 3 different decks!',
        lottieFile: 'Rabbit.json'
    },
    'midnight_matcher': {
        name: 'Midnight Matcher',
        description: 'Play a matching game after 10 PM!',
        lottieFile: 'owl.json'
    }
};

// Match Maker tier thresholds
const matchMakerTiers = {
    bronze: { min: 1, max: 10 },
    silver: { min: 11, max: 50 },
    gold: { min: 51, max: 150 },
    diamond: { min: 151, max: Infinity }
};

module.exports = { achievementMap, matchMakerTiers };