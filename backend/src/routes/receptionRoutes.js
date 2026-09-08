const express = require('express');
const receptionController = require('../controllers/receptionController');
const { validate, receptionSchema } = require('../validators/schemas');
const { authenticate, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireTenant);

router.get('/', receptionController.list);
router.post('/', validate(receptionSchema), receptionController.create);
router.get('/:id', receptionController.getById);

module.exports = router;
