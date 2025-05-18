const config = require('./utils/config');
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const middleware = require('./utils/middleware');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const usersRouter = require('./controllers/users');
const cardRouter = require('./controllers/cards');
const deckRouter = require('./controllers/decks');
const learningHistoryRouter = require('./controllers/learningHistory');
const gamificationRouter = require('./controllers/gamification');
const weeklyRouter = require('./controllers/weeklyRanking')

logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDB: ', error.message);
    });

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

app.use(cookieParser());
app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

app.use(middleware.requestLogger);

// API routes should be prefixed with '/api'
app.use('/api', usersRouter);
app.use('/api', cardRouter);
app.use('/api', deckRouter);
app.use('/api', learningHistoryRouter)
app.use('/api/gamification', gamificationRouter)
app.use('/api', weeklyRouter)

// Test route to check if API is working
app.get('/api/test', (request, response) => {
    response.json('test ok');
});

// Handle unknown endpoints for API routes
app.use('/api', middleware.unknownEndpoint);

// Error handler middleware
app.use(middleware.errorHandler);

// Serve the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

module.exports = app;
