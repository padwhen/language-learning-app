const mongoose = require('mongoose')
const { Schema } = mongoose

const XpHistorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    },
    xpAmount: {
        type: Number,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'daily_login',
            'card_study',
            'deck_completion',
            'streak_bonus',
            'level_up_bonus',
            'achievement_bonus',
            'quiz_completion',
            'lesson_completion',
            'match_game_complete',
            'other'
        ]
    },
    eventDetails: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
})

XpHistorySchema.index({ userId: 1, date: -1 })

const XpHistoryModel = mongoose.model('XpHistory', XpHistorySchema)

module.exports = XpHistoryModel