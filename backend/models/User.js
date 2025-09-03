const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    name: { type: String }, 
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    deckIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }],
    avatarUrl: { type: String, default: 'https://github.com/shadcn.png'},

    flashcardWordForm: {
        type: String,
        enum: ['original', 'base'],
        default: 'original',
        description: 'Whether to use original base form or changed form in flashcards (e.g.,herkulliNEN vs herkulliSTA)'
    },

    // Gamification Features
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 }, 
    currentStreak: { type: Number, default: 0 }, 
    maxStreak: { type: Number, default: 0 }, 
    lastActiveDate: { type: Date, default: null }, 
    streakFreezes: { type: Number, default: 0 }, 
    xpMultiplier: { type: Number, default: 1.0 }, // Default multiplier is 1x (no boost)
    xpMultiplierExpiration: { type: Date, default: null }, // When the multiplier expires

    loginDates: [{
        date: { type: Date, required: true }, 
        month: { type: String, required: true },
        year: { type: Number, required: true },
    }],

    // Achievements and Badges
    achievements: [{
        name: { type: String, required: true },
        dateEarned: { type: Date, default: Date.now }, 
        description: { type: String }
    }],
    badges: [{
        name: { type: String, required: true },
        tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], required: true },
        dateEarned: { type: Date, default: Date.now }
    }],

    weeklyXP: { type: Number, default: 0 }, // XP earned in current week
    weeklyXPHistory: [{
        week: { type: String, required: true }, // Format: "YYYY-WW" (e.g., "2025-10")
        xp: { type: Number, required: true }, 
        rank: { type: Number },
        percentile: { type: Number }, 
        tier: { type: String, enum: ['Emerald', 'Diamond', 'Ruby', 'None'] },
        region: { type: String }
    }],
    region: { type: String, default: null }
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel