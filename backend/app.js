const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const cookieParser = require('cookie-parser')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB')
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDB: ', error.message)
    })

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

app.use(cookieParser()) 
app.use(express.json())

app.use(middleware.requestLogger)

app.use('/', usersRouter)

app.get('/api/test', (request, response) => {
    response.json('test ok')
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app