const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');

const router = express.Router();
const analytics_controller = new AnalyticsController();

router.get('/', analytics_controller.index.bind(analytics_controller));
router.post('/', analytics_controller.filter.bind(analytics_controller))

module.exports = router;