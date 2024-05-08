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

module.exports = deckRouter