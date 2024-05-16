const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleCommentSchema = new Schema({
    articleId: {
        type: Object,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        min: 3,
        max: 128
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    }
}, { timestamps: true });

const ArticleComment = mongoose.model('Article_Comment', articleCommentSchema);
module.exports = ArticleComment;