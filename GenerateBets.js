const { render } = require("ejs");
var session = require('express-session');
const Bet = require('./models/Bet');
const Leagues = require('./Leagues');
const mongoose = require('mongoose');

const USER_ID = new mongoose.Types.ObjectId('618efd55c9ecdf78e1dba635');
const LEAGUE_NAMES = ['NHL', 'MLB', 'NBA', 'NFL'];
const RESULT = ['win', 'loss', 'push'];
const NUM_BETS = 50;
var num_saves = 0;

GenerateBets = {
    generate(){
        var bet = {};
        for(var i = 0; i < NUM_BETS; i++){
            bet.user_id = USER_ID;
            var random_league = this.random(0, 4);
            var team1_random = this.random(0, 12);
            var team2_random = this.random(13, 23);
            var bet_on_random = this.random(0, 1);
            var result_random = this.random(0, 3);
            var random_month = this.random(9, 12);
            var random_day;
            if(random_month == 11)
                random_day = this.random(1, 12);
            else
                random_day = this.random(1, 30);

            if(random_month < 10)
                random_month = '0' + random_month;

            if(random_day < 10)
                random_day = '0' + random_day;

            bet.league = LEAGUE_NAMES[random_league];
            bet.team1 = Leagues[LEAGUE_NAMES[random_league]].teams[team1_random];
            bet.team2 = Leagues[LEAGUE_NAMES[random_league]].teams[team2_random];
            if(bet_on_random == 0)
                bet.betOn = bet.team1
            else
                bet.betOn = bet.team2;
            bet.stake = this.random(1, 1000);
            
            if(Math.round(Math.random()) == 0)
                bet.odds = this.random(100, 500) * -1;
            else
                bet.odds = this.random(100, 500);

            bet.result = RESULT[result_random];
            bet.dateOfGame = new Date(`2021-${random_month}-${random_day}`);

            const db_bet = new Bet(bet);
            db_bet.save()
            .then(() => {
                num_saves++;
                console.log("Num saves performed: " + num_saves);
            })
            .catch((err)=> console.log(err));
        }
    },

    random(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
}

module.exports = GenerateBets;