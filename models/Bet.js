const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betSchema = new Schema({
    user_id: {
        type: Object,
        required: true
    },
    league: {
        type: String,
        required: true
    },
    team1: {
        type: String,
        required: true
    },
    team2: {
        type: String,
        required: true
    },
    betOn: {
        type: String,
        required: true
    },
    stake: {
        type: Number,
        required: true
    },
    odds: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    dateOfGame: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Bet = mongoose.model('Bet', betSchema);
module.exports = Bet;