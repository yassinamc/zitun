const express = require('express');
const authController = require('../controllers/authController');
const { validate, loginSchema, registerSchema } = require('../validators/schemas');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);

module.exports = router;
