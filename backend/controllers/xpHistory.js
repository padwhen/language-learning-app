const express = require('express');
const xpHistoryRouter = express.Router();
const XpHistory = require('../models/XpHistory');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const { verifyToken } = require('../utils/middleware');
const { request } = require('../app');

xpHistoryRouter.use(verifyToken)

xpHistoryRouter.get('/xp-history', async (request, response) => {
    try {
        const { token } = request.cookies
        const userData = jwt.verify(token, JWT_SECRET)

        if (!userData || !userData.id) {
                return response.status(401).json({ error: 'Invalid token data' })
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const xpHistory = await XpHistory.find({
            userId: userData.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 })

        const groupedHistory = {}
        xpHistory.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0]
            if (!groupedHistory[dateKey]) {
                groupedHistory[dateKey] = {
                    date: dateKey,
                    totalXp: 0,
                    events: []
                }
            }
            groupedHistory[dateKey].totalXp += entry.xpAmount
            groupedHistory[dateKey].events.push({
                xpAmount: entry.xpAmount,
                eventType: entry.eventType,
                eventDetails: entry.eventDetails,
                time: entry.date
            })
        })

        const historyArray = Object.values(groupedHistory).sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        )

        response.json({
            xpHistory: historyArray,
            totalDays: historyArray.length,
            totalXpInPeriod: historyArray.reduce((sum, day) => sum + day.totalXp, 0)
        })

    } catch (error) {
        console.error('Error fetching XP history: ', error)
        if (error instanceof jwt.JsonWebTokenError) {
            response.status(401).json({ error: 'Invalid token' })
        } else {
            response.status(500).json({ error: 'Internal Server Error' })
        }
    }
})

xpHistoryRouter.get('/login-history', async (request, response) => {
    try {
        const { token } = request.cookies;
        const userData = jwt.verify(token, JWT_SECRET)

        if (!userData || !userData.id) {
            return response.status(401).json({ error: 'Invalid token data' });
        }

        const user = await User.findById(userData.id);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const currentMonthLogins = user.loginDates.filter(login => 
            login.month === currentMonth
        ).sort((a, b) => new Date(b.date) - new Date(a.date)); 

        // Create a set of login dates for easy checking
        const loginDatesSet = new Set(
            currentMonthLogins.map(login => 
                login.date.toISOString().split('T')[0]
            )
        )

        response.json({
            loginDates: currentMonthLogins,
            currentMonth,
            totalLoginDays: currentMonthLogins.length,
            loginDatesArray: Array.from(loginDatesSet).sort()
        });
    } catch (error) {
        console.error('Error fetching login history: ', error)
        if (error instanceof jwt.JsonWebTokenError) {
            response.status(401).json({ error: 'Invalid token' });
        } else {
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }
})

module.exports = xpHistoryRouter