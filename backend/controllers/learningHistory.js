const express = require('express')
const router = express.Router()
const LearningHistory = require('../models/LearningHistory')
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const Deck = require('../models/Deck');

const config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    seed: Math.floor(Math.random() * 10)
}
  
const createRandomName = () => {
    return uniqueNamesGenerator(config)
}

router.post('/learning-history/save-quiz-result', async (req, res) => {
    try {
        const { userId, deckId, cardsStudied, correctAnswers, quizType, quizDetails } = req.body
        const nextQuizDate = determineNextQuizDate(cardsStudied, correctAnswers)

        const processedQuizDetails = quizDetails.map(card => ({
            question: card.engCard,
            userAnswer: card.userLangCard,
            correctAnswer: card.correctAnswer,
            correct: card.correct,
            cardId: card._id
        }))

        const history = new LearningHistory({
            userId, deckId, cardsStudied, correctAnswers, quizType, nextQuizDate,
            randomName: createRandomName(), quizDetails: processedQuizDetails
        })
        await history.save()
        res.status(201).json({ message: 'Quiz results saved succesfully', history })
    } catch (error) {
        res.status(500).json({ message: 'Error saving quiz result', error: error.message })
    }
})

router.get('/learning-history/:userId/:deckId', async (req, res) => {
    try {
        const { userId, deckId } = req.params;
        const history = await LearningHistory.find({ userId, deckId }).sort({ date: -1 });
        if (history.length > 0) {
            const formattedHistory = history.map(entry => ({
                date: new Date(entry.date).toLocaleDateString(),
                cardsStudied: entry.cardsStudied,
                quizType: entry.quizType,
                correctAnswers: entry.correctAnswers
            }));
            res.json({ history: formattedHistory });
        } else {
            res.status(404).json({ message: 'No quiz history found' });
        }
    } catch (error) {
        console.error('Error fetching learning history:', error);
        res.status(500).json({ message: 'Error fetching learning history', error: error.message });
    }
});


router.get('/learning-history/next-quiz-date/:userId/:deckId', async (req, res) => {
    try {
        const { userId, deckId } = req.params
        const latestHistory = await LearningHistory.findOne({ userId, deckId })
            .sort({ date: -1 })
            .limit(10)
        if (latestHistory) {
            res.json({ nextQuizDate: latestHistory.nextQuizDate, _id: latestHistory._id })
        } else {
            res.status(404).json({ message: 'No quiz history found '})
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving next quiz date', error: error.message })
    }
})

router.get('/learning-history/:learningHistoryId', async (req, res) => {
    try {
        const { learningHistoryId } = req.params
        const quizHistory = await LearningHistory.findById(learningHistoryId)
        if (quizHistory) {
            res.json(quizHistory)
        } else {
            res.status(404).json({ message: 'Quiz history not found '})
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving quiz history', error: error.message })
    }
})

function determineNextQuizDate(cardsStudied, correctAnswers) {
    const performance = correctAnswers / cardsStudied
    let daysUntilNextQuiz;

    if (performance > 0.8) {
        daysUntilNextQuiz = 7;
    } else if (performance > 0.6) {
        daysUntilNextQuiz = 3
    } else { 
        daysUntilNextQuiz = 1
    }

    const nextQuizDate = new Date()
    nextQuizDate.setDate(nextQuizDate.getDate() + daysUntilNextQuiz)
    return nextQuizDate
}

module.exports = router