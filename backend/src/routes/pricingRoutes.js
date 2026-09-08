const express = require('express');
const pricingController = require('../controllers/pricingController');
const { validate, pricingSchema } = require('../validators/schemas');
const { authenticate, requireTenant, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireTenant);

router.get('/', pricingController.get);
router.put(
  '/',
  requireRoles('TENANT_OWNER', 'MANAGER', 'PLATFORM_ADMIN'),
  validate(pricingSchema),
  pricingController.update
);

module.exports = router;
