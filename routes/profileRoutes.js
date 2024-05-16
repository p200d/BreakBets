const express = require('express');
const ProfileController = require('../controllers/ProfileController');

const router = express.Router();
const profile_controller = new ProfileController();

router.get('/', profile_controller.index.bind(profile_controller));
router.post('/', profile_controller.updateProfile.bind(profile_controller));

module.exports = router;