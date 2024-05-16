const { render } = require("ejs");
const User = require('../models/User');
const Bet = require('../models/Bet');
const mongoose = require('mongoose');
const Leagues = require('../Leagues');
const Factory = require('../Factory');
const Decorator = require('../Decorator');
const RenderDecorator = Decorator.RenderDecorator;
const RenderObject = Decorator.RenderObject;
var session = require('express-session');

class RegisterController{
    constructor(){
        this.bet_list = [];
        this.net_gain = 0;
        this.charts = {
            line_chart: {},
            pie_chart: {},
            doughnut_chart: {},
        };
    }

    index(req, res){
        this.bet_list = [];
        const view = new RenderDecorator(RenderObject('analytics', req), { 
            Leagues: Leagues, current_date: this.getCurrentDate(), 
            start_date: this.getStartOfMonth(), charts: this.charts, bets: this.bet_list, showCharts: false
        });
        res.render(view.page(), view.data());
    }

    renderView(req, res){
        const view = new RenderDecorator(RenderObject('analytics', req), { 
            Leagues: Leagues, current_date: this.getCurrentDate(), start_date: this.getStartOfMonth(), 
            bets: this.bet_list, charts: this.charts, showCharts: true, stats: this.calculateStats()
        });
        res.render(view.page(), view.data());
    }

    filter(req, res){
        if(!this.checkLogin(req)){
            res.redirect('/login');
        }
        else{
            if(this.validateFilter(req.body)){
                if(this.validateFilter(req.body)){
                    this.net_gain = 0;
                    const search_parameters = this.buildSearchParameters(req.body, req);
                    Bet.find(search_parameters)
                    .sort({dateOfGame: 1})
                    .then((bets_result) => {
                        this.bet_list = bets_result;
                        this.addPayout();
                        this.generateCharts();
                        this.renderView(req, res);
                    })
                }
            }
            else{
                this.index(req, res);
            }
        }
    }

    buildSearchParameters(form, req){
        var searchObject = {
            $and: [],
        }

        searchObject.$and.push({user_id: new mongoose.Types.ObjectId(req.session.userID)});

        if(form.league != 'All')
            searchObject.$and.push({league: form.league});

        if(form.team != 'All')
            searchObject.$and.push({betOn: form.team});

        if(form.result != 'All')
            searchObject.$and.push({result: form.result.toLowerCase()});

        searchObject.$and.push({stake: {$gte: form.min_bet}});
        searchObject.$and.push({stake: {$lte: form.max_bet}});
        searchObject.$and.push({dateOfGame: {$gte: new Date(form.start_date).toISOString()}});
        searchObject.$and.push({dateOfGame: {$lte: new Date(form.end_date).toISOString()}});
        
        return searchObject;
    }

    generateCharts(){
        const factory = new Factory();
        Object.assign(this.charts.line_chart, factory.createChart('line', this.bet_list));
        Object.assign(this.charts.pie_chart, factory.createChart('pie', this.bet_list));
        Object.assign(this.charts.doughnut_chart, factory.createChart('doughnut', this.bet_list));
    }

    calculateStats(){
        var stats = {
            num_wins: 0,
            num_losses: 0,
            num_pushes: 0,
        };

        this.bet_list.forEach(bet => {
            if(bet.result == 'win')
                stats.num_wins++;
            else if(bet.result == 'loss')
                stats.num_losses++;
            else
                stats.num_pushes++;
        })

        stats.win_percent = (stats.num_wins / (stats.num_wins + stats.num_losses + stats.num_pushes) * 100).toFixed(2);
        stats.loss_percent = (stats.num_losses / (stats.num_wins + stats.num_losses + stats.num_pushes) * 100).toFixed(2);
        stats.push_percent = (stats.num_pushes / (stats.num_wins + stats.num_losses + stats.num_pushes) * 100).toFixed(2);
        stats.net_gain = (this.net_gain).toFixed(2);
        stats.average_payout = (this.net_gain / this.bet_list.length).toFixed(2);

        return stats;
    }

    addPayout(){
        for(var index = 0; index < this.bet_list.length; index++){
            if(this.bet_list[index].result == 'loss'){
                this.bet_list[index].payout = this.bet_list[index].stake * -1;
            }
            else if(this.bet_list[index].result == 'push'){
                this.bet_list[index].payout = 0;
            }
            else{
                if(this.bet_list[index].odds < 0){
                    this.bet_list[index].payout = this.bet_list[index].stake / (this.bet_list[index].odds/100) * -1;
                    this.bet_list[index].payout = (Math.floor(this.bet_list[index].payout * 100) / 100).toFixed(2);
                }
                else{
                    this.bet_list[index].payout = this.bet_list[index].stake * (this.bet_list[index].odds/100);
                    this.bet_list[index].payout = (Math.floor(this.bet_list[index].payout * 100) / 100).toFixed(2);
                }
            }
            this.net_gain = this.net_gain + Number(this.bet_list[index].payout);
        }
    }

    getCurrentDate(){
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    }

    getStartOfMonth(){
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()+1}-01`;
    }

    validateFilter(form){
        return(
            this.validateBet(form.min_bet) && this.validateBet(form.max_bet) &&
            this.validateDate(form.start_date) && this.validateDate(form.end_date)
        );
    }

    validateBet(min_bet){
        if(isNaN(Number(min_bet)))
            return false;

        return true;
    }

    validateDate(date){
		var checkIncomplete = Number(date.replace(/-/g, 1));
		if(Number.isNaN(checkIncomplete) || date == '') //Check if incomplete date (ex: yyyy-10-13)
			return false;

        return true;
    }

    checkLogin(req){
        return(req.session.userID != null);
    }

}

module.exports = RegisterController;