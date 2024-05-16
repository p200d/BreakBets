const { render } = require("ejs");
var session = require('express-session');
const Article = require("../models/Article");
const ArticleComment = require('../models/ArticleComment');
const mongoose = require('mongoose');
const User = require("../models/User");
const Decorator = require('../Decorator');
const RenderDecorator = Decorator.RenderDecorator;
const RenderObject = Decorator.RenderObject;

class NewsController{
    constructor(){
        this.article = { title: "", body: "", author: "", createdAt: ""};
        this.error = { title: {valid: true}, body: {valid: true}, comment: {valid: true}, hidden: true};
        this.article_list = [];
        this.comment_list = [];
    }

    renderView(req, res){
        const view = new RenderDecorator(RenderObject('news', req), {error: this.error, form: this.form, articles: this.article_list });
        res.render(view.page(), view.data());
    }

    index(req, res){
        this.resetView();
        Article.find()
        .sort({createdAt: -1})
        .then(result => {
            this.article_list = result;
            this.renderView(req, res)
        })
    }

    createArticle(req, res){
        if(!req.session.isEditor) //User is not an editor
            this.index(req, res);
        else{ //User is editor, validate and create article
            this.error.hidden = false;
            req.body.author = req.session.username;
            this.form = req.body;
            if(!this.validateArticle())
                this.renderView(req, res);
            else{
                const article = new Article(req.body);
                article.save()
                .then(() => {
                    res.redirect('/news');
                })
            }
        }
    }

    editArticle(req, res){
        this.form.body = req.body.body;
        if(!this.validateBody(req.body.body)){
            this.error.body.valid = false;
            this.error.hidden = false;
            this.renderArticle(req, res);
        }
        else{
            this.error.body.valid = true;
            this.error.hidden = true;
            Article.updateOne(
                { _id: mongoose.Types.ObjectId(req.params.id) }, 
                { body: req.body.body }
            )
            .then(result => {
                this.articleIndex(req, res);

            })
        }
    }

    createComment(req, res){
        if(!this.checkLogin(req)){ //Guest, cannot create comment, redirect to login.
            res.redirect('/login');
        }
        else{
            if(req.body.comment.trim() < 3 || req.body.comment.trim() > 128){ //Invalid
                this.error.comment.valid = false;
                this.renderArticle(req, res);
            }
            else{ //Valid
                this.error.comment.valid = true;
                const comment_parameters = { articleId: mongoose.Types.ObjectId(req.params.id), author: req.session.username, message: req.body.comment };
                const new_comment = new ArticleComment(comment_parameters);
                new_comment.save() //Add new bet to DB
                .then(() => {
                    Article.findByIdAndUpdate({_id: req.params.id},{ $inc: { numComments: 1}}) //Increment numComments
                    .then(() => {
                        this.articleIndex(req, res);
                    })
                })
            }
        }
    }

    validateArticle(){
        var valid = true;
        if(!this.validateTitle(this.form.title)){
            this.error.title.valid = false;
            valid = false;
        }else
            this.error.title.valid = true;
        if(!this.validateBody(this.form.body)){
            this.error.body.valid = false;
            valid = false;
        }else
            this.error.body.valid = true;

        return valid;
    }

    validateTitle(title){
        return (title.trim().length >= 3 && title.trim().length <= 60)
    }

    validateBody(body){
        return (body.trim().length >= 3 && body.trim().length <= 2000)
    }

    resetView(){
        this.error = { title: {valid: true}, body: {valid: true}, comment: {valid: true}, hidden: true};
        this.form = { title: "", body: ""};
    }

    articleIndex(req, res){
        this.resetView();
        Article.findById({_id: req.params.id})
        .then(result => {
            this.article = result;
            ArticleComment.find({ articleId: result._id})
            .sort({createdAt: -1})
            .then(comments => {
                this.comment_list = comments;
                this.renderArticle(req, res);
            })
        })
        .catch(() => res.render('404'));
    }

    deleteComment(req, res){
        ArticleComment.findById(req.params.id)
        .then((comment) => {
            Article.findById(comment.articleId)
            .then((article) => {
                //Delete request by article author or commenter, valid
                if(req.session.username == comment.author || req.session.username == article.author){
                    ArticleComment.updateOne({ _id: mongoose.Types.ObjectId(req.params.id) },{ deleted: true })
                        .then(() => {res.end()});
                }
            })
        })
    }

    deleteArticle(req, res){
        Article.findById(req.params.id) //Check if user is author
        .then((result) => {
            if(result.author == req.session.username){ //Logged in user is author of article, delete
                ArticleComment.deleteMany({articleId: mongoose.Types.ObjectId(req.params.id)}) //Delete comments associated with article
                .then(() => {
                    Article.findByIdAndDelete(req.params.id) //Delete article
                    .then(() => {
                        res.redirect('/news');
                    })
                })
            }
            else
                res.redirect('/news');
        })
        .catch(() => res.redirect('/news'));
    }

    renderArticle(req, res){
        const view = new RenderDecorator(RenderObject('article', req), {article: this.article, error: this.error, comments: this.comment_list});
        res.render(view.page(), view.data());
    }

    checkLogin(req){
        if(req.session.userID != null) //User logged in
            return true;
        return false; //User is not logged in
    }

}

module.exports = NewsController;