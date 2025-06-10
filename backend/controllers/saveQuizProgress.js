const express = require('express');
const router = express.Router();
const SavedQuizProgress = require('../models/SavedQuizProgress');
const Deck = require('../models/Deck');
const { verifyToken } = require('../utils/middleware');

router.use(verifyToken);

// Save current quiz progress
router.post('/:userId/:deckId', async (req, res) => {
    try {
        const { deckId, userId } = req.params
        const { userData } = req
        const {
            currentQuestion,
            answers,
            score,
            quizItems,
            settings
        } = req.body
        if (userId !== userData.id) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        console.log({ deckId })
        console.log({ userId })
        const deck = await Deck.findOne({ _id: deckId })     
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' })
        }
        const progress = await SavedQuizProgress.findOneAndUpdate(
            { userId, deckId },
            {
                currentQuestion,
                answers, 
                score,
                quizItems,
                settings,
                lastSavedAt: new Date()
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        )
        res.status(200).json({
            message: 'Progress saved successfully',
            progress
        })
    } catch (error) {
        console.error('Error saving quiz progress:', error)
    }
})

router.get('/:userId/:deckId', async (req, res) => {
    try {
        const { userId, deckId } = req.params
        const { userData } = req
        if (userId !== userData.id) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const progress = await SavedQuizProgress.findOne({
            userId,
            deckId,
            expiresAt: { $gt: new Date() }
        })
        if (!progress) {
            return res.status(404).json({ 
                message: 'No saved progress found'
            })
        }
        res.status(200).json(progress)
    } catch (error) {
        console.error('Error fetching quiz progress: ', error)
        res.status(500).json({
            message: 'Error fetching quiz progress',
            error: error.message
        })
    }
})

router.delete('/:userId/:deckId', async (req, res) => {
    try {
        const { userId, deckId } = req.params
        const { userData } = req

        if (userId !== userData.id) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        const result = await SavedQuizProgress.deleteOne({
            userId, 
            deckId
        })
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'No saved progress found'
            })
        }
        res.status(200).json({
            message: 'Progress deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting quiz progress: ', error)
        res.status(500).json({
            message: 'Error deleting quiz progress',
            error: error.message
        })
    }
})

router.delete('/cleanup', async (req, res) => {
    try {
        const result = await SavedQuizProgress.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        res.status(200).json({
            message: 'Expired progress cleaned up successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error cleaning up expired progress:', error);
        res.status(500).json({
            message: 'Error cleaning up expired progress',
            error: error.message
        });
    }
});

module.exports = router