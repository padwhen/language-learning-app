const { JWT_SECRET } = require('./config')
const logger = require('./logger')
const jwt = require('jsonwebtoken')


const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path: ', request.path)
    logger.info('Body: ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

const verifyToken = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
        const userData = jwt.verify(token, JWT_SECRET)
        req.userData = userData
        next()
    } catch (error) {
        console.error('Error verifying token: ', error)
        return res.status(401).json({ error: 'Unauthorized' })
    }
}

const isAdmin = (request, response, next) => {
    // Ensure verifyToken has already run and attached user to request
    if (!request.userData) {
        console.error('isAdmin middleware error: request.userData not found. Is verifyToken running first?')
        return response.status(500).json({ error: 'User data not available for admin check.'})
    }

    if (!request.userData.isAdmin) {
        console.log(`Admin access denied for user: ${request.userData.username || request.userData.id}`)
        return response.status(403).json({ error: 'Forbidden: Admin access required'})
    }

    // If user is admin, proceed to the next middleware/route handler
    console.log(`Admin access granted for user: ${request.userData.username || request.userData.id}`)
    next()
}

module.exports = {
    requestLogger, unknownEndpoint, errorHandler, verifyToken, isAdmin  
}