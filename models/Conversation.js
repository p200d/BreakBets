const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: {
        type: Array,
        required: true
    },
    messages: [{ 
        sender: {type: String}, 
        body: {type: String}
    }]
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;