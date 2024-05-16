const express = require('express');
const RegisterController = require('../controllers/RegisterController');

const router = express.Router();
const register_controller = new RegisterController();

router.get('/', register_controller.index.bind(register_controller));
router.post('/', register_controller.createAccount.bind(register_controller));

module.exports = router;