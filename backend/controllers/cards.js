const express = require('express')
const cardRouter = express.Router()
const Card = require('../models/Card')

cardRouter.get('/api/cards/:cardId', async (request, response) => {
    const { cardId } = request.params
    try {
        const card = await Card.findById(cardId)
        if (!card) {
            return response.status(404).json({ message: 'Card not found' })
        }
        response.json(card)
    } catch (error) {
        console.error('Error fetching card: ', error)
        response.status(500).json({ message: 'Internal Server Error' })
    }
})

cardRouter.post('/api/cards', async (request, response) => {
    try {
        const { engCard, userLangCard, cardScore } = request.body;
        const newCard = await Card.create({
            engCard, userLangCard, cardScore: cardScore || 0
        })
        response.json(newCard)
    } catch (error) {
        console.error('Error creating new card', error)
        response.status(500).json({ message: 'Internal Server Error' })
    }
})

cardRouter.put('/api/cards/:cardId', async (request, response) => {
    const { cardId } = request.params
    const { cardScore } = request.body;
    try {
        const updatedCard = await Card.findByIdAndUpdate(
            cardId, { cardScore }, { new: true }
        )
        if (!updatedCard) {
            return response.status(404).json({ message: 'Card not found' })
        }
        response.json(updatedCard)
    } catch (error) {
        console.error('Error updating card score: ', error)
        response.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = cardRouter