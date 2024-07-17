const express = require('express')
const deckRouter = express.Router()
const Deck = require('../models/Deck')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')

deckRouter.get('/decks', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const userData = jwt.verify(token, JWT_SECRET)
        const decks = await Deck.find({ owner: userData.id })
        response.json(decks)
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

deckRouter.get('/decks/:id', async (request, response) => {
    const { id } = request.params
    try {
        const deck = await Deck.findById(id)
        if (!deck) {
            return response.status(404).json({ message: 'Deck not found' })
        }
        response.json(deck)
    } catch (error) {
        console.error('Error fetching deck', error)
        response.status(500).json({ message: 'Internal Server Error' })
    }
})

deckRouter.post('/decks', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const { deckName, deckTags } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const deckDoc = await Deck.create({
            owner: userData.id, deckName, deckTags
        })
        response.json(deckDoc)
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

// PUT update a specified deck by ID
deckRouter.put('/decks/:id', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const { id } = request.params
        const { cards } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const updatedDeck = await Deck.findOneAndUpdate(
            { _id: id, owner: userData.id },
            { $set: { cards: cards } }, 
            { new: true}
        )
        if (!updatedDeck) {
            return response.status(404).json({ error: 'Deck not found' })
        }
        response.json(updatedDeck)
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

// Add new card to a deck
deckRouter.put('/decks/update-card/:id', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const { id } = request.params
        const { cards } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const updatedDeck = await Deck.findOneAndUpdate(
            { _id: id, owner: userData.id },
            { cards }, 
            { new: true}
        )
        if (!updatedDeck) {
            return response.status(404).json({ error: 'Deck not found' })
        }
        response.json(updatedDeck)
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error'})
    }
})

// PUT update a specific card in a deck
deckRouter.put('/decks/update-card/:deckId/:cardId', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const { deckId, cardId } = request.params
        const { engCard, userLangCard } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const deck = await Deck.findOne({ _id: deckId, owner: userData.id })
        if (!deck) {
            return response.status(404).json({error: 'Deck not found'})
        }
        const cardToUpdate = deck.cards.id(cardId)
        if (!cardToUpdate) {
            return response.status(404).json({ error: 'Card not found' });
        }
        cardToUpdate.engCard = engCard;
        cardToUpdate.userLangCard = userLangCard;
        cardToUpdate.cardScore = 0;
        await deck.save()
        response.json(deck)
    } catch (error) {
        console.error('Error updating card: ', error)
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

// PUT the entire deck
deckRouter.put('/decks/update/:id', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) { 
            return response.status(401).json({ erorr: 'Unauthorized' })
        }
        const { id } = request.params
        const { deckName, deckTags, deckPercentage, cards } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const updatedDeck = await Deck.findOneAndUpdate(
            { _id: id, owner: userData.id },
            { deckName, deckTags, deckPercentage, cards },
            { new: true }
        )
        if (!updatedDeck) {
            return response.status(404).json({ error: 'Deck not found' })
        }
        response.json(updatedDeck)
    } catch (error) {
        console.error('Error updating deck', error)
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

// Update favorite of a card
deckRouter.put('/decks/:deckId/cards/:cardId/favorite', async (request, response) => {
    try {
        const { token } = request.cookies
        if (!token) {
            return response.status(401).json({ error: 'Unauthorized' })
        }
        const { deckId, cardId } = request.params
        const { favorite } = request.body
        const userData = jwt.verify(token, JWT_SECRET)
        const deck = await Deck.findOne({ _id: deckId, owner: userData._id })
        if (!deck) {
            return response.status(404).json({ error: 'Deck not found' })
        }
        const card = deck.cards.id(cardId)
        if (!card) {
            return response.status(404).json({ error: 'Card not found' })
        }
        card.favorite = favorite
        await deck.save()
        response.json(deck)
    } catch (error) {
        console.error('Error updating card favorite status: ', error)
        response.status(500).json({ error: 'Internal Server Error' })
    }
})

module.exports = deckRouter