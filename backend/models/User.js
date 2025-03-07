const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    name: { type: String }, 
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    deckIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }],
    avatarUrl: { type: String, default: 'https://github.com/shadcn.png'},

    // Gamification Features
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 }, 
    currentStreak: { type: Number, default: 0 }, 
    maxStreak: { type: Number, default: 0 }, 
    lastActiveDate: { type: Date, default: null }, 
    streakFreezes: { type: Number, default: 0 }, 
    xpMultiplier: { type: Number, default: 1.0 }, // Default multiplier is 1x (no boost)
    xpMultiplierExpiration: { type: Date, default: null }, // When the multiplier expires

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
    }]
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel