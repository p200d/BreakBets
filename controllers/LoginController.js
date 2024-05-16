const { render } = require("ejs");
const User = require('../models/User');
var session = require('express-session');

class LoginController{
    constructor(){
        this.error = {valid: true, message: "Username or password is incorrect"};
    }

    renderView(req, res){
        const error = this.error;
        res.render('login', { error });
    }

    index(req, res){
        this.error.valid = true;
        this.renderView(req, res);
    }

    login(req, res){
        User.find({username: req.body.username}) //Find User by username
            .then(result => {
                if(typeof result[0] == 'object') //Username in DB exists
                    if(result[0].password == req.body.password){ //Passwords match, log in successful
                        req.session.userID = result[0]._id;
                        req.session.username = req.body.username; //Set session to username
                        req.session.isEditor = result[0].isEditor;
                        res.redirect('/');
                    }
                    else{
                        this.error.valid = false;
                        this.renderView(req, res);
                    }
                else{
                    this.error.valid = false;
                    this.renderView(req, res);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
}

module.exports = LoginController;