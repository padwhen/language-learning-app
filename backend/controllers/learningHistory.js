const express = require('express')
const router = express.Router()
const LearningHistory = require('../models/LearningHistory')
const { uniqueNamesGenerator, colors, animals } = require('unique-names-generator');
const { verifyToken } = require('../utils/middleware');

const config = {
    dictionaries: [colors, animals],
    separator: '_',
    seed: Math.floor(Math.random() * 10)
}
  
const createRandomName = () => {
    return uniqueNamesGenerator(config)
}

router.use(verifyToken)

router.post('/learning-history/save-quiz-result', async (req, res) => {
    try {
        const { userId, deckId, cardsStudied, correctAnswers, quizType, quizDetails } = req.body;
        const { userData } = req;

        if (userId !== userData.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const nextQuizDate = determineNextQuizDate(quizType, cardsStudied, correctAnswers);

        const processedQuizDetails = quizDetails.map(card => ({
            question: card.engCard,
            userAnswer: card.userAnswer,
            correctAnswer: card.correctAnswer,
            correct: card.correct,
            cardId: card._id,
            cardScore: card.cardScore,
            timeTaken: card.timeTaken
        }));

        let randomName;
        let originalLearningSession;
        let reviewNumber = 0;

        if (quizType === 'learn') {
            // For "learn" sessions, create a new random name
            randomName = createRandomName();
            originalLearningSession = null;
        } else {
            // For "review" sessions, find the latest "learn" session
            originalLearningSession = await LearningHistory.findOne({
                userId,
                deckId,
                quizType: 'learn'
            }).sort({ date: -1 });

            if (!originalLearningSession) {
                return res.status(400).json({ message: 'No learn session found for review' });
            }

            reviewNumber = originalLearningSession.reviewSessions.length + 1;
            randomName = `${originalLearningSession.randomName}_Review${String(reviewNumber).padStart(2, '0')}`;
        }

        const history = new LearningHistory({
            userId,
            deckId,
            cardsStudied,
            correctAnswers,
            quizType,
            nextQuizDate,
            randomName,
            quizDetails: processedQuizDetails,
            originalLearningSession: originalLearningSession ? originalLearningSession._id : null,
            reviewNumber
        });

        if (originalLearningSession) {
            // Add this review session to the reviewSessions array of the original learn session
            originalLearningSession.reviewSessions.push(history._id);
            await originalLearningSession.save();
        }

        await history.save();
        res.status(201).json({ message: 'Quiz results saved successfully', history });
    } catch (error) {
        res.status(500).json({ message: 'Error saving quiz result', error: error.message });
    }
});


router.get('/learning-history/:userId/:deckId', async (req, res) => {
    try {
        const { userId, deckId } = req.params;
        const { userData } = req
        if (userId !== userData.id) {
            return res.status(403).json({ message: 'Forbidden. You cannot access other user\'s learning history' })
        }
        const history = await LearningHistory.find({ userId, deckId }).sort({ date: -1 });
        if (history.length > 0) {
            const formattedHistory = history.map(entry => ({
                date: new Date(entry.date).toLocaleDateString(),
                cardsStudied: entry.cardsStudied,
                quizType: entry.quizType,
                correctAnswers: entry.correctAnswers,
                id: entry._id,
                randomName: entry.randomName
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
        const { userData } = req
        if (userId !== userData.id) {
            return res.status(403).json({ message: 'Forbidden. You cannot access other user\'s learning history' })
        }
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

router.delete('/learning-history', async (req, res) => {
    try {
        await LearningHistory.deleteMany({});
        res.status(200).json({ message: 'All learning history deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting learning history', error: error.message });
    }
});


router.get('/learning-history/:learningHistoryId', async (req, res) => {
    try {
        const { learningHistoryId } = req.params
        const { userData } = req

        const learningHistory = await LearningHistory.findById(learningHistoryId);
        if (!learningHistory) {
            return res.status(404).json({ message: 'Learning history not found' });
        }

        if (learningHistory.userId.toString() !== userData.id) {
            return res.status(403).json({ message: 'Forbidden: You cannot delete another user\'s learning history' });
        }

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

function determineNextQuizDate(quizType, cardsStudied, correctAnswers) {
    const performance = correctAnswers / cardsStudied;
    let daysUntilNextQuiz = 1; // default for learn

    if (quizType === 'review') {
        if (performance >= 0.8) {
            daysUntilNextQuiz = Math.round(daysUntilNextQuiz * 2);
        } else if (performance < 0.6) {
            daysUntilNextQuiz = Math.max(1, Math.round(daysUntilNextQuiz * 0.5));
        }
        daysUntilNextQuiz = Math.min(30, daysUntilNextQuiz);
    }

    const nextQuizDate = new Date();
    nextQuizDate.setDate(nextQuizDate.getDate() + daysUntilNextQuiz);
    return nextQuizDate;
}

module.exports = router