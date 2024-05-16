const express = require('express');
const LoginController = require('../controllers/LoginController');

const router = express.Router();
const login_controller = new LoginController();

router.get('/', login_controller.index.bind(login_controller));
router.post('/', login_controller.login.bind(login_controller));

module.exports = router;