const mongoose = require('mongoose')    
const { Schema } = mongoose

const WeeklyRankingSchema = new Schema({
    week: { type: String, required: true },
    lastReset: { type: Date, required: true },
    nextReset: { type: Date, required: true }, 
    globalRankings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true },
        xp: { type: Number, required: true },
        percentile: { type: Number }
    }],
    regionalRankings: [{
        region: { type: String, required: true }, 
        rankings: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            username: { type: String, required: true }, 
            xp: { type: Number, required: true },
            percentile: { type: Number }
        }]
    }]
})

WeeklyRankingSchema.index({ week: 1}, { unique: true })
WeeklyRankingSchema.index({ 'globalRankings.userId': 1, week: 1 })
WeeklyRankingSchema.index({ 'regionalRankings.region': 1, week: 1 })

const WeeklyRanking = mongoose.model('WeeklyRanking', WeeklyRankingSchema)

module.exports = WeeklyRanking