const express = require('express');
const customerController = require('../controllers/customerController');
const { validate, customerSchema } = require('../validators/schemas');
const { authenticate, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireTenant);

router.get('/', customerController.list);
router.post('/', validate(customerSchema), customerController.create);
router.get('/:id', customerController.getById);
router.put('/:id', validate(customerSchema), customerController.update);
router.delete('/:id', customerController.remove);

module.exports = router;
