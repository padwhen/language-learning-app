const express = require('express')
const deckRouter = express.Router()
const Deck = require('../models/Deck')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')

deckRouter.get('/api/decks', async (request, response) => {
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

deckRouter.get('/api/decks/:id', async (request, response) => {
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

deckRouter.post('/api/decks', async (request, response) => {
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

deckRouter.put('/api/decks/:id', async (request, response) => {
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
            { $push: { cards: { $each: cards } } }, 
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

deckRouter.put('/api/decks/update-card/:id', async (request, response) => {
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

module.exports = deckRouter