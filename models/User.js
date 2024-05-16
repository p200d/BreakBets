const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, minLength: 3, maxLength: 1 },
    email: { type: String, required: true },
    password: { type: String, required: true, minLength: 6, maxLength: 20 },
    friends: { type: Array, required: false },
    inFriendRequests: { type: Array, required: false },
    outFriendRequests: { type: Array, required: false },
    unread: { type: Array, required: false },
    isEditor: { type: Boolean, default: false, required: false }
}, { timestamps: true });

var User = mongoose.model('User', userSchema);
module.exports = User;