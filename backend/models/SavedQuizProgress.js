const mongoose = require('mongoose')

const savedQuizProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck',
        required: true  
    },
    currentQuestion: {
        type: Number,
        required: true,
        min: 1
    },
    answers: [{
        question: Number,
        userAnswer: String,
        correctAnswer: String,
        correct: Boolean,
        cardId: String,
        cardScore: Number,
        timeTaken: Number
    }],
    score: {
        type: Number,
        required: true,
        min: 0
    },
    quizItems: [{
        userLangCard: String,
        options: [String], 
        correctAnswer: String,
        correctIndex: Number,
        cardId: String,
    }],
    settings: {
        includeCompletedCards: Boolean,
        cardsToLearn: Number,
        cardTypeToLearn: {
            type: String,
            enum: ['All', 'Not studied', 'Learning', 'Completed']
        },
        shuffleCards: Boolean
    },
    lastSavedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
})

// Index for faster queries and automatic cleanup
savedQuizProgressSchema.index({ userId: 1, deckId: 1 })
savedQuizProgressSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const SavedQuizProgress = mongoose.model('SavedQuizProgress', savedQuizProgressSchema)
module.exports = SavedQuizProgress