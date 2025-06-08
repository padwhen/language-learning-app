const mongoose = require('mongoose')

const QuizSessionSchema = new mongoose.Schema({
    question: String,
    userAnswer: String,
    correctAnswer: String,
    correct: Boolean,
    cardId: String,
    cardScore: Number,
    timeTaken: Number
})

const LearningHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deckId: { type: mongoose.Schema.Types.ObjectId, ref:' Deck', required: true },
    date: { type: Date, default: Date.now },
    cardsStudied: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    quizType: { type: String, enum: ['learn', 'review', 'resume'], required: true },
    nextQuizDate: { type: Date, required: true },
    // Reference to the original learning session if this is a review
    originalLearningSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningHistory'
    },
    // Array of review sessions that followed this learning session
    reviewSessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningHistory'
    }],
    reviewNumber: { type: Number, default: 0 },
    randomName: { type: String, required: true },
    nextInterval: { type: Number, default: 1 }, 
    quizDetails: [QuizSessionSchema]
})

const LearningHistoryModel = mongoose.model('LearningHistory', LearningHistorySchema)

module.exports = LearningHistoryModel