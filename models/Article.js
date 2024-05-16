const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 60
    },
    body: {
        type: String,
        required: true,
        min: 3,
        max: 2000
    },
    numComments: {
        type: Number,
        default: 0
    },
    lastEdited: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;