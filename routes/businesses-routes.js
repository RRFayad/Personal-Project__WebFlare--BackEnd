const express = require('express');
const { check } = require('express-validator');

const businessControllers = require('../controllers/businesses-controller');

const router = express.Router();

router.get('/', businessControllers.getAllBusinesses);
router.get('/user/:uid', businessControllers.getBusinessesByUserId);
router.get('/:bid', businessControllers.getBusinessById);
router.post(
  '/',
  [
    check('title').isLength({ min: 3 }),
    check('type').notEmpty(),
    check('niche').notEmpty(),
    check('age').notEmpty().isNumeric,
    check('monthlyRevenue').notEmpty().isNumeric,
    check('monthlyProfit').notEmpty().isNumeric,
    check('askingPrice').notEmpty().isNumeric,
    check('description').isLength({ min: 6 }),
    check('ownerId').notEmpty(),
  ],
  businessControllers.createBusiness,
);
router.patch(
  '/:bid',
  [
    check('title').isLength({ min: 3 }),
    check('type').notEmpty(),
    check('niche').notEmpty(),
    check('age').notEmpty().isNumeric,
    check('monthlyRevenue').notEmpty().isNumeric,
    check('monthlyProfit').notEmpty().isNumeric,
    check('askingPrice').notEmpty().isNumeric,
    check('description').isLength({ min: 6 }),
    check('ownerId').notEmpty(),
  ],
  businessControllers.updateBusinessById,
);
router.delete('/:bid', businessControllers.deleteBusinessById);

module.exports = router;
