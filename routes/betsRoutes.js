const express = require('express');
const BetsController = require('../controllers/BetsController');

var router = express.Router();
var bets_controller = new BetsController();

router.get('/', bets_controller.index.bind(bets_controller));
router.post('/', bets_controller.create.bind(bets_controller));
router.delete('/:id', bets_controller.deleteBet.bind(bets_controller));
router.post('/promote', bets_controller.promote.bind(bets_controller))

module.exports = router;