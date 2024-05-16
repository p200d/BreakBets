const registerRoutes = require('./registerRoutes');
const loginRoutes = require('./loginRoutes');
const betsRoutes = require('./betsRoutes');
const profileRoutes = require('./profileRoutes');
const newsRoutes = require('./newsRoutes');
const friendsRoutes = require('./friendsRoutes');
const analyticsRoutes = require('./analyticsRoutes');

class MainRouter{
    constructor(){
        this.register = registerRoutes;
        this.login = loginRoutes;
        this.bets = betsRoutes;
        this.profile = profileRoutes;
        this.news = newsRoutes;
        this.friends = friendsRoutes;
        this.analytics = analyticsRoutes;
    }
}

module.exports = MainRouter;