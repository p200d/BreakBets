const express = require('express');
const NewsController = require('../controllers/NewsController');

const router = express.Router();
const news_controller = new NewsController();

router.get('/', news_controller.index.bind(news_controller));
router.post('/', news_controller.createArticle.bind(news_controller));
router.get('/:id', news_controller.articleIndex.bind(news_controller));
router.post('/delete/:id', news_controller.deleteArticle.bind(news_controller));
router.post('/edit/:id', news_controller.editArticle.bind(news_controller));
router.get('/edit/:id', (req, res) => {res.redirect(`/news/${req.params.id}`)});
router.post('/comment/:id', news_controller.createComment.bind(news_controller));
router.get('/comment/:id', (req, res) => {res.redirect(`/news/${req.params.id}`)});
router.delete('/comment/delete/:id', news_controller.deleteComment.bind(news_controller));

module.exports = router;