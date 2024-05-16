const User = require('../models/User');
var session = require('express-session');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
var validator = require("email-validator");
const Decorator = require('../Decorator');
const RenderDecorator = Decorator.RenderDecorator;
const RenderObject = Decorator.RenderObject;

class ProfileController{

    constructor(){
        this.error = {
            email: { valid: true, message: "Invalid email address format."},
            current_password: { valid: true, message: "Incorrect password." },
            new_password: { valid: true, message: "Password must be 6-20 characters." },
            confirm_password: { valid: true, message: "Passwords do not match." },
            success: false
        }
        this.form = {
            email: '',
            current_password: '',
            new_password: '',
            confirm_password: ''
        };
    }

    renderView(req, res){
        const view = new RenderDecorator(RenderObject('profile', req), {error: this.error, form: this.form});
        res.render(view.page(), view.data());
    }

    index(req, res){
        if(!this.checkLogin(req))
            res.redirect('/login');
        else{
            this.resetView();
            User.findById(req.session.userID)
            .then((result) => {
                this.form.email = result.email;
                this.renderView(req, res);
            })
        }
    }

    updateProfile(req, res){
        if(!this.checkLogin(req))
            res.redirect('/login');
        else{
            if(!this.validEmail(req.body.email))
                this.error.email.valid = false;
            else
                this.error.email.valid = true;
            
            if(req.body.changePassword == 'on'){ //Change password selected
                User.findById(req.session.userID)
                .then(result => {
                    this.form = req.body;
                    if(!this.validatePasswords(result.password, req.body)){//Invalid, render errors, don't update pass
                        this.validateForm();
                        this.renderView(req, res);
                    }
                    else{ //Update password
                        User.updateOne(
                            { _id: mongoose.Types.ObjectId(req.session.userID) }, 
                            { password: req.body.newPassword }
                        )
                        .then(result => {
                            this.validateForm();
                            this.renderView(req, res);
                        })
                    }
                })
            }
            else{
                this.validateForm();
                this.renderView(req, res);
            }
        }
    }

    validatePasswords(currentPass, body){
        var valid = true;
        if(!this.passwordsMatch(currentPass, body.currentPassword)){
            this.error.current_password.valid = false;
            valid = false;
        }
        else
            this.error.current_password.valid = true;

        if(!this.validPassword(body.newPassword)){
            this.error.new_password.valid = false;
            valid = false;
        }
        else
            this.error.new_password.valid = true;

        if(!this.passwordsMatch(body.newPassword, body.confirmPassword)){
            this.error.confirm_password.valid = false;
            valid = false;
        }
        else
            this.error.confirm_password.valid = true;

        if(!valid)
            this.error.success = false;

        return valid;
    }

    passwordsMatch(password1, password2){
        return password1 == password2;
    }

    validPassword(password){
        return (password.length >= 6 && password.length <= 20);
    }

    checkLogin(req){
        if(req.session.userID != null) //User logged in
            return true;
        return false; //User is not logged in
    }

    validEmail(email){
        //return validator.validate(email);
        if(validator.validate(email)){
            return true;
        }
        else{
            return false;
        }
    }

    validateForm(){
        this.error.success = (this.error.email.valid && this.error.current_password.valid && 
            this.error.new_password.valid && this.error.confirm_password.valid);
    }

    resetView(req, res){
        this.error.email.valid = true;
        this.error.current_password.valid = true;
        this.error.new_password.valid = true;
        this.error.confirm_password.valid = true;
        this.error.success = false;
        
        this.form = {
            email: '',
            current_password: '',
            new_password: '',
            confirm_password: ''
        };
    }
}

module.exports = ProfileController;