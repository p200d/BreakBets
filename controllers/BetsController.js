const { render } = require("ejs");
var session = require('express-session');
const User = require('../models/User')
const Bet = require('../models/Bet');
const Leagues = require('../Leagues');
const mongoose = require('mongoose');
const Decorator = require('../Decorator');
const RenderDecorator = Decorator.RenderDecorator;
const RenderObject = Decorator.RenderObject;

class BetsController{
    constructor(){
        this.error = {
            stake: {valid: true, message: "Stake must be a dollar amount."},
            odds: {valid: true, message: "Odds must be less than -100 or greater than 100."},
            date: {valid: true, message: "Select current date or earlier."}
        }
        this.bet_list = {};
        this.form = {};
        this.resetView();
    }

    renderView(req, res){
        const view = new RenderDecorator(RenderObject('bets', req), 
            {bets: this.bet_list, Leagues: Leagues, loggedIn: this.checkLogin(req), error: this.error, form: this.form});

        res.render(view.page(), view.data());
    }

    resetView(){
        this.error.stake.valid = true;
        this.error.odds.valid = true;
        this.error.date.valid = true;

        this.bet_list = [];
        this.form = {
            league: Object.keys(Leagues)[0],
            team1: Leagues[Object.keys(Leagues)[0]].teams[0],
            team2: Leagues[Object.keys(Leagues)[0]].teams[1],
            betOn: Leagues[Object.keys(Leagues)[0]].teams[0],
            stake: '',
            odds: '',
            dateOfGame: '',
            result: 'win'
        }
    }

    index(req, res){
        this.resetView();
        if(!this.checkLogin(req)){
            this.renderView(req, res);
        }
        else{
            Bet.find({ user_id: new mongoose.Types.ObjectId(req.session.userID) }) //All bets by user
                .sort({createdAt: -1}) //Creation date
                .then(result => {
                    this.bet_list = result;
                    this.renderView(req, res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    create(req, res){
        if(!this.checkLogin(req)){ //User is not logged in, redirect to login page
            res.redirect('/login');
        }
        else{ //Validate and save bet to DB
            this.form = req.body;
            req.body.user_id = new mongoose.Types.ObjectId(req.session.userID);
            if(!this.validateNewBet(req.body)){ //Bet is invalid
                this.renderView(req, res); //Render errors
            }
            else{ //Bet is valid, create DB document
                req.body.dateOfGame = new Date(req.body.dateOfGame); //Convert date to date Object.
                const bet = new Bet(req.body);
                bet.save() //Add new bet to DB
                .then(() => {
                    this.index(req, res);
                })
                .catch(err => {
                    console.log(err);
                })
            }
        }
    }

    validateNewBet(body){
        var valid = true;

        if(!this.validateStake(body.stake)){
            this.error.stake.valid = false;
            valid = false;
        }
        else
            this.error.stake.valid = true;

        if(!this.validateOdds(body.odds)){
            valid = false;
            this.error.odds.valid = false;
        }
        else
            this.error.odds.valid = true;

        if(!this.validateDate(body.dateOfGame)){
            valid = false;
            this.error.date.valid = false;
        }
        else
            this.error.date.valid = true;

        return valid;
    }

    validateOdds(odds){
        odds = Number(odds);
        if(isNaN(odds))
            return false;
        if(!Number.isInteger(odds))
            return false;
        if(odds > -100 && odds < 100)//Odds between [-100, 100], invalid
            return false;

        return true;
    }

    validateStake(stake){
        stake = Number(stake);
        if(isNaN(stake))
            return false;
        if(stake <= 0)
            return false;
        if(!Number.isInteger(stake)){ //Stake is not an integer, check if valid dollar amount [2 decimals]
            var stakeString = stake.toString().split('.').pop();
            if(stakeString.length > 2){
                return false;
            }
        }
        return true;
    }

    validateDate(date){
		var checkIncomplete = Number(date.replace(/-/g, 1));
		if(Number.isNaN(checkIncomplete)) //Check if incomplete date (ex: yyyy-10-13)
			return false;
	
        const selectedDate = new Date(Date.parse(date));
        const currentDate = new Date();
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        if(selectedDate <= currentDate)
            return true;
        else
            return false;
    }

    deleteBet(req, res){
        if(!this.checkLogin(req)){
            res.redirect('/login');
        }
        else{
            const bet_id = req.params.id;
            Bet.find({_id: bet_id}) //Search for bet with id
            .then(result => {
                if(result[0].user_id.toString() != req.session.userID){ //Bet does not belong to current user
                    res.redirect('/bet');
                }
                else{ //Delete bet
                    Bet.findByIdAndDelete(req.params.id)
                    .then(result => {
                        for(var i = 0; i < this.bet_list.length; i++){
                            if(this.bet_list[i]._id.toString() == req.params.id)
                                this.bet_list.splice(i, 1);
                        }
                        this.renderView(req, res);
                    })
                }
            })
            .catch(() => {res.render('404');});
        }
    }

    promote(req, res){
        console.log(req.session.userID);
        if(this.checkLogin(req)){
            User.findById(req.session.userID)
            .then((result) => {
                if(result.isEditor == false){
                    User.findByIdAndUpdate(req.session.userID, {isEditor: true})
                    .then(() => {req.session.isEditor = true; res.redirect('/bets')})
                }
                else{
                    res.redirect('/bets');
                }
            })
        }
        else{
            res.redirect('/bets');
        }
    }

    checkLogin(req){
        if(req.session.userID != null) //User logged in
            return true;
        return false; //User is not logged in
    }
}

module.exports = BetsController;