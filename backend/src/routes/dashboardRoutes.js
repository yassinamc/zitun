const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireTenant);
router.get('/metrics', dashboardController.metrics);

module.exports = router;
