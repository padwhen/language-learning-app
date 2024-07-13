const mongoose = require('mongoose')

const LearningHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deckId: { type: mongoose.Schema.Types.ObjectId, ref:' Deck', required: true },
    date: { type: Date, default: Date.now },
    cardsStudied: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    quizType: { type: String, enum: ['learn', 'review'], required: true },
    nextQuizDate: { type: Date, required: true },
    randomName: { type: String, required: true },
    quizDetails: [{
        question: String, 
        userAnswer: String,
        correctAnswer: String,
        correct: Boolean,
        cardId: String,
        cardScore: Number,
        timeTaken: Number
    }]
})

const LearningHistoryModel = mongoose.model('LearningHistory', LearningHistorySchema)

module.exports = LearningHistoryModel