const express = require('express')
const adminRouter = express.Router()
const User = require('../models/User')

const { verifyToken, isAdmin } = require('../utils/middleware')

// Apply token verification AND admin check to ALL routes defined in this file
adminRouter.use(verifyToken)
adminRouter.use(isAdmin)

adminRouter.get('/test', (request, response) => {
    response.json({ message: `Welcome Admin User ${request.userData.username || request.userData.id}`})
})

module.exports = adminRouter    