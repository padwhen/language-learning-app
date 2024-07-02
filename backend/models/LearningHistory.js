const mongoose = require('mongoose')

const LearningHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deckId: { type: mongoose.Schema.Types.ObjectId, ref:' Deck', required: true },
    date: { type: Date, default: Date.now },
    cardsStudied: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    quizType: { type: String, enum: ['learn', 'review'], required: true },
    nextQuizDate: { type: Date, required: true }
})

const LearningHistoryModel = mongoose.model('LearningHistory', LearningHistorySchema)

module.exports = LearningHistoryModel