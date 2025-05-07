const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const usersRouter = express.Router()
const User = require('../models/User')
const { JWT_SECRET, BCRYPT_SALT } = require('../utils/config')

usersRouter.post('/register', async (request, response) => {
    const { name, username, pin } = request.body
    try {
        const userDoc = await User.create({
            name, 
            username, 
            pin: bcrypt.hashSync(pin, BCRYPT_SALT),
            lastActiveDate: null, 
        })
        response.json(userDoc)
    } catch (error) {
        response.status(422).json(error)
    }
})

usersRouter.post('/login', async (request, response) => {
    const { username, pin } = request.body
    const userDoc = await User.findOne({username})
    if (userDoc) {
        const passOk = bcrypt.compareSync(pin, userDoc.pin)
        if (passOk) {
            jwt.sign({ 
                id: userDoc._id,
                username: userDoc.username,
                isAdmin: userDoc.isAdmin 
            }, JWT_SECRET, {}, (error, token) => {
                if (error) throw error;
                response.cookie('token', token).json(userDoc)
            })
        } else {
            response.status(422).json('Password incorrect. Please try again.')
        }
    } else {
        response.status(422).json('Username not found. Please try again.')
    }
})

usersRouter.get('/profile', async (request, response) => {
    try {
        const { token } = request.cookies; 
        if (!token) {
            return response.status(500).json({ error: 'Token not found' })
        }
        jwt.verify(token, JWT_SECRET, {}, async (error, userData) => {
            if (error) {
                return response.status(500).json({ error: 'Invalid token' })
            }
            if (!userData || !userData.id) {
                return response.status(500).json({ error: 'Invalid user data in token'})
            }
            const user = await User.findById(userData.id)
            if (!user) {
                return response.status(500).json({ error: 'User not found' })
            }
            response.json(user.toJSON())
        })
    } catch (error) {
        console.error('Error in /profile: ', error)
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

usersRouter.put('/update', async (request, response) => {
    const { token } = request.cookies;
    if (!token) return response.status(401).json({ error: 'Authentication required' })
    jwt.verify(token, JWT_SECRET, {}, async (error, userData) => {
        if (error) return response.status(401).json({ error: 'Invalid token' })
        const { id } = userData
        const { name, username, avatarUrl } = request.body
        try {
            const existingUser = await User.findOne({ username })
            if (existingUser && existingUser._id.toString() !== id) {
                return response.status(422).json({ error: 'Username already exists. Please choose another one'})
            }
            const updatedUser = await User.findByIdAndUpdate(id, { name, username, avatarUrl }, { new: true, runValidators: true })
            if (!updatedUser) return response.status(404).json({ error: 'User not found '})
            const { name: updatedName, username: updatedUsername, avatarUrl: updatedAvatarUrl } = updatedUser
            response.json({ name: updatedName, username: updatedUsername, avatarUrl: updatedAvatarUrl });
        } catch (error) {
            console.error('Error in /update: ', error)
        }
    })
})

usersRouter.post('/logout', (request, response) => {
    response.cookie('token', '').json(true)
})

module.exports = usersRouter