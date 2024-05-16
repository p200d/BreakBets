const express = require('express');
const mongoose = require('mongoose');
var dotenv = require('dotenv');
var session = require('express-session');
var MainRouter = require('./routes/MainRouter');
const PORT = 3000;

//Initialize dotenv config
dotenv.config();

//Create instance of express app
var app = express();

//Connect to MongoDB
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(PORT, () => { //Promise, wait for DB connection, then start server if successful
        console.log(`DB connected. Listening at http://localhost:${PORT}`);
    }))
    .catch((err) => console.log(err)); //Failed to connect to DB

//Register View Engine
app.set('view engine', 'ejs');

//Middleware & Static Files
app.use(express.static('public')); //Allow access to public folder
app.use(express.urlencoded({ extended: true })); //Middleware for POST request url handling
app.use(session({   //Start session for login/authorization
    secret: ' ',
    resave: false,
    saveUninitialized: false,
}));

//Routes
const routes = new MainRouter();
app.get('/', (req, res) => { //Index Page
    res.redirect('/analytics');
    /* res.render('index', {username: req.session.username}); */
    console.log('Session userID: ' + req.session.userID);
    console.log('Session username: ' + req.session.username);
    console.log('Session isEditor: ' + req.session.isEditor);
});

app.get('/logout', (req, res) => {
    req.session.username = undefined;
    req.session.userID = undefined;
    req.session.isEditor = undefined;
    res.redirect('/login');
})

app.use('/register', routes.register);
app.use('/login', routes.login);
app.use('/bets', routes.bets);
app.use('/profile', routes.profile)
app.use('/news', routes.news);
app.use('/friends', routes.friends);
app.use('/analytics', routes.analytics);
app.use((req, res) => { res.status(404).render('404', {username: req.session.username, editor: req.session.editor}) }); //'Else' 404, page doesn't exist