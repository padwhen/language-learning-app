const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const geoip = require('geoip-lite')
const usersRouter = express.Router()
const User = require('../models/User')
const { JWT_SECRET, BCRYPT_SALT } = require('../utils/config')

// Helper function to get city from IP
const getRegionFromIP = (ip) => {
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === 'localhost'
    const lookupIp = isLocalhost ? '193.166.13.253' : ip // Use Finnish IP for testing
    const geo = geoip.lookup(lookupIp)
    return geo ? geo.city : null    
}

usersRouter.post('/register', async (request, response) => {
    const { name, username, pin } = request.body
    try {
        const ip = request.ip || request.connection.remoteAddress
        const region = getRegionFromIP(ip)
        const userDoc = await User.create({
            name, 
            username, 
            pin: bcrypt.hashSync(pin, BCRYPT_SALT),
            lastActiveDate: null, 
            region
        })
        response.json(userDoc)
    } catch (error) {
        response.status(422).json(error)
    }
})

usersRouter.post('/login', async (request, response) => {
    const { username, pin } = request.body
    const userDoc = await User.findOne({ username })
    if (!userDoc) {
        return response.status(422).json('Username not found. Please try again.')
    }

    const passOk = bcrypt.compareSync(pin, userDoc.pin)
    if (!passOk) {
        return response.status(422).json('Password incorrect. Please try again.')
    }
    if (!userDoc.region) {
        const ip = request.ip || request.connection.remoteAddress
        const region = getRegionFromIP(ip)
        if (region) {
            userDoc.region = region
            await userDoc.save()
        }
    }

    jwt.sign({ id: userDoc._id }, JWT_SECRET, {}, (error, token) => {
        if (error) throw error
        response.cookie('token', token).json(userDoc)
    })
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
            if (!user.region) {
                const ip = request.ip || request.connection.remoteAddress
                const region = getRegionFromIP(ip)
                if (region) {
                    user.region = region
                    await user.save()
                }
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