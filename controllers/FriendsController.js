var session = require('express-session');
const { isValidObjectId } = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Decorator = require('../Decorator');
const RenderDecorator = Decorator.RenderDecorator;
const RenderObject = Decorator.RenderObject;

class FriendsController{

    constructor(){
        this.error = { valid: true, message: ""}
        this.form = { username: "" };
        this.friends = {};
    }

    renderView(req, res){
        User.findById(req.session.userID)
        .then((user_result) => {
            if(this.checkLogin(req)){
                this.friends.list = user_result.friends;
                this.friends.incoming = user_result.inFriendRequests;
                this.friends.outgoing = user_result.outFriendRequests;
            }
            const view = new RenderDecorator(RenderObject('friends', req), {error: this.error, form: this.form, friends: this.friends});
            res.render(view.page(), view.data());
        })
    }

    index(req, res){
        this.resetView();
        if(!this.checkLogin(req)){
            this.renderView(req, res);
        }
        else{
            User.findById(req.session.userID)
            .then((user_result) => {
                this.friends.list = user_result.friends;
                this.friends.incoming = user_result.inFriendRequests;
                this.friends.outgoing = user_result.outFriendRequests;
                this.renderView(req, res);
            })
        }
    }

    createPending(req, res){
        if(!this.checkLogin(req)){
            res.redirect('/login');
        }
        else{
            this.form.username = req.body.username;
            User.find({username: req.body.username}) //Search user in DB to add
            .then((user_result) => {
                if(user_result.length == 0){ //User does not exist
                    this.setError("User does not exist.");
                    this.renderView(req, res);
                }
                else{ //User exists, check pending & added
                    if(user_result[0].username == req.session.username){
                        this.setError("Cannot add yourself.");
                        this.renderView(req, res);
                    }
                    else if(user_result[0].friends.includes(req.session.username)){ //Already friends
                        this.setError("You are already friends.");
                        this.renderView(req, res);
                    }
                    else if(user_result[0].inFriendRequests.includes(req.session.username) ||
                        user_result[0].outFriendRequests.includes(req.session.username)){ //Friend request already pending
                        this.setError("Friend request already pending.");
                        this.renderView(req, res);
                    }
                    else{ //Create pending request
                        User.findByIdAndUpdate(req.session.userID, { $push: { outFriendRequests: req.body.username } }) //Add other to outgoing request
                        .then(() => {
                            User.updateOne({username: req.body.username}, { $push: { inFriendRequests: req.session.username } }) //Add current to incoming request
                            .then(() => {
                                this.resetView();
                                this.renderView(req, res);
                            })
                        })
                    }
                }
            })
        }
    }

    deletePending(req, res){
        if(this.checkLogin(req)){
            User.findById(req.session.userID)
            .then((user_result) => {
                if(user_result.inFriendRequests.includes(req.params.username)){
                    User.findByIdAndUpdate(req.session.userID, { $pull: {inFriendRequests: req.params.username} })
                    .then(() => {
                        //Remove incoming friend request from other user
                        User.findOneAndUpdate({username: req.params.username}, { $pull: {outFriendRequests: req.session.username} })
                        .then(() => {
                            res.end();
                        });
                    });
                }
                else{
                    //Remove outgoing friend request from current user
                    User.findByIdAndUpdate(req.session.userID, { $pull: {outFriendRequests: req.params.username} })
                    .then(() => {
                        //Remove incoming friend request from other user
                        User.findOneAndUpdate({username: req.params.username}, { $pull: {inFriendRequests: req.session.username} })
                        .then(() => {
                            res.end();
                        });
                    });
                }
            })
        }
        else{
            res.end();
        }
    }

    addPending(req, res){
        if(this.checkLogin(req)){
            User.findById(req.session.userID)
            .then((user_result) => {
                if(user_result.inFriendRequests.includes(req.params.username)){
                    //Add friend and remove incoming pending [Curren user]
                    User.findByIdAndUpdate(req.session.userID, 
                        { $push: { friends: req.params.username }, $pull: { inFriendRequests: req.params.username }})
                    .then(() => {
                        //Add friend to other user and remove outgoing from other user
                        User.findOneAndUpdate({username: req.params.username},
                        { $push: { friends: req.session.username }, $pull: { outFriendRequests: req.session.username }})
                        .then(() => {
                            //Find existing conversation.
                            Conversation.find({ participants: { $all: [req.session.username, req.params.username]} })
                            .then((conversation_result) => {
                                if(conversation_result.length == 0){ //Conversation doesn't exist, create one
                                    const convo = new Conversation({participants: [req.session.username, req.params.username]});
                                    convo.save() //Create new conversation ID
                                    .then(() => {
                                        res.end();
                                    })
                                }
                                else{
                                    res.end();
                                }
                            })
                        })
                    })
                }
                else{
                    res.end();
                }
            })
        }
        else{
            res.end();
        }
    }

    deleteFriend(req, res){
        if(this.checkLogin(req)){
            User.findByIdAndUpdate(req.session.userID, { $pull: {friends: req.params.username} }) //Remove friend from current user.
            .then(() => {
                User.findOneAndUpdate({username: req.params.username}, { $pull: {friends: req.session.username}}) //Remove current user from friend
                .then(() => {
                    res.end();
                })
            })
        }
        else{
            res.end();
        }
    }

    getMessages(req, res){
        if(this.checkLogin(req)){
            Conversation.find({ participants: { $all: [req.session.username, req.params.username]} })
            .then((conversation_result) => {
                res.send(conversation_result)
            })
        }
        else{
            res.end();
        }
    }

    getUnreadPMs(req, res){
        if(this.checkLogin(req)){
            User.findById(req.session.userID)
            .then((user_result) => {
                res.send(user_result.unread);
            })
        }
        else{
            res.end();
        }
    }

    getUserInfo(req, res){
        if(this.checkLogin(req)){
            User.find({username: req.params.username})
            .then((result) => {
                res.send({unread: result[0].unread, editor: result[0].isEditor, friends: result[0].friends});
            })
            .catch(() => res.end());
        }
        else{
            res.end();
        }
    }

    sendMessage(req, res){
        if(this.checkLogin(req) && req.params.message.length > 0 && req.params.message.length <= 128){
            Conversation.find({ participants: { $all: [req.session.username, req.params.username]}})
            .then((result) => {
                if(result.length == 0){
                    const convo = new Conversation({participants: [req.session.username, req.params.username]});
                    convo.save() //Create new conversation ID
                    .then(() => {
                        Conversation.findOneAndUpdate({ participants: { $all: [req.session.username, req.params.username]} }, 
                            { $push: { messages: {sender: req.session.username, body: req.params.message}}})
                        .then(() => {
                            res.end();
                        })
                    })
                }
                else{
                    Conversation.findOneAndUpdate({ participants: { $all: [req.session.username, req.params.username]} }, 
                        { $push: { messages: {sender: req.session.username, body: req.params.message}}})
                    .then(() => {
                        res.end();
                    })
                }
            })
        }
        else{
            res.end();
        }
    }

    userExists(req, res){
        if(this.checkLogin(req) && req.session.isEditor){
            User.find({ username: req.params.username })
            .then((result) => {
                if(result.length > 0)
                    res.send({exists: true});
                else
                    res.send({exists: false});
            })
        }
        else{
            res.end();
        }
    }

    addUnread(req, res){
        if(this.checkLogin(req) && req.session.isEditor){
            User.findOneAndUpdate({ username: req.params.username }, {$addToSet: { unread: req.session.username }})
            .then(() => {
                res.end();
            })
        }
        else{
            res.end();
        }
    }

    deleteUnread(req, res){
        if(this.checkLogin(req)){
            User.findByIdAndUpdate(req.session.userID, {$pull: { unread: req.params.username }})
            .then(() => {
                res.end();
            })
        }
        else{
            res.end();
        }
    }

    checkLogin(req){
        if(req.session.userID != null) //User logged in
            return true;
        return false; //User is not logged in
    }

    setError(message){
        this.error.valid = false;
        this.error.message = message;
    }

    resetView(){
        this.error.valid = true;
        this.error.message = "";
        this.form.username = "";
    }
}

module.exports = FriendsController;