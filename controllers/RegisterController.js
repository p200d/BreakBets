const { render } = require("ejs");
const User = require('../models/User');
var validator = require("email-validator");
var session = require('express-session');


class RegisterController{
    constructor(){
        this.error = {
                username: {valid: true, message: "Username must be 3-16 letters/numbers."},
                usernameExists: {valid: true, message: "Username already exists."},
                email: {valid: true, message: "Invalid email address format."},
                password: {valid: true, message: "Password must be 6-20 characters."},
                confirmPassword: {valid: true, message: "Passwords do not match."}
        };

        this.form = {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        };
    }

    renderView(req, res){
        res.render('register', { error: this.error, form: this.form });
    }

    index(req, res){
        this.resetView();
        this.renderView(req, res);
    }

    createAccount(req, res){
        User.find({username: req.body.username}) //Get user with username (if exists)
        .collation({locale: 'en', strength: 2}) //Case insensitive search
        .then(result => {
            this.form.username = req.body.username;
            this.form.email = req.body.email;
            this.form.password = req.body.password;
            this.form.confirmPassword = req.body.confirmPassword;

            if(!this.validateRegistration(result, req.body)){ //Invalid registration
                this.renderView(req, res);
            }
            else{ //Valid registration, create account in DB
                const user = new User(req.body);
                user.save()
                .then(() => {
                    User.find({username: req.body.username}) //Find newly created user for userID to auto log in.
                    .then(result => {
                        req.session.userID = result[0]._id; //Assign DB user ID to session ID "aka log in"
                        req.session.username = req.body.username; //Assign session to username
                        res.redirect('/') //Go to home page
                    })
                })
            }
        })
    }

    validateRegistration(result, body){
        var valid = true;
        if(this.validPassword(body.password))
            this.error.password.valid = true;
        else{
            this.error.password.valid = false;
            valid = false;
        }
        if(this.passwordsMatch(body.password, body.confirmPassword))
            this.error.confirmPassword.valid = true;
        else{
            this.error.confirmPassword.valid = false;
            valid = false;
        }
        if(this.validEmail(body.email))
            this.error.email.valid = true;
        else{
            this.error.email.valid = false;
            valid = false;
        }
        if(this.validUsername(body.username))
            this.error.username.valid = true;
        else{
            this.error.username.valid = false;
            valid = false;
        }
        if(result.length > 0){ //Username exists, invalid
            this.error.usernameExists.valid = false;
            valid = false;
        }
        else //Username exists, invalid
            this.error.usernameExists.valid = true;

        return valid;
    }
    
    //Returns true if 3-16 characters, letters and numbers only
    validUsername(username){
        //return /^[a-zA-Z0-9]{3,16}$/.test(username);
        if(/^[a-zA-Z0-9]{3,16}$/.test(username)){
            console.log("Valid username");
            return true;
        }
        else{
            console.log("Invalid username");
            return false;
        }
    }
    
    validEmail(email){
        //return validator.validate(email);
        if(validator.validate(email)){
            console.log("Valid email");
            return true;
        }
        else{
            console.log("Invalid email");
            return false;
        }
    }
    
    //Returns true if password is 6-20 characters.
    validPassword(password){
        //return(password.length >= 6 && password.length <= 20);
        if(password.length >= 6 && password.length <= 20){
            console.log("Valid password");
            return true;
        }
        else{
            console.log("Invalid password");
            return false;
        }
    }
    
    //Uses email-validator plugin to validate email
    passwordsMatch(password, confirmPassword){
        //return(password == confirmPassword);
        if(password == confirmPassword){
            console.log("Valid matching passwords");
            return true;
        }
        else{
            console.log("Invalid passwords don't match");
            return false;
        }
    }

    resetView(){
        this.error.username.valid = true;
        this.error.usernameExists.valid = true;
        this.error.email.valid = true;
        this.error.password.valid = true;
        this.error.confirmPassword.valid = true;

        this.form.username = "";
        this.form.email = "";
        this.form.password = "";
        this.form.confirmPassword = "";
    }
}

module.exports = RegisterController;