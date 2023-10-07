const express = require('express');
const { check } = require('express-validator');

const businessControllers = require('../controllers/businesses-controller');
const fileUpload = require('../middlewares/file-upload');

const router = express.Router();

router.get('/', businessControllers.getAllBusinesses);
router.get('/:bid', businessControllers.getBusinessById);
router.get('/user/:uid', businessControllers.getBusinessesByUserId);
router.post(
  '/',
  fileUpload.single('image'),
  (req, res, next) => {
    next();
  },
  [
    check('title')
      .isLength({ min: 3 })
      .withMessage('Title must have at least 3 characters'),
    check('type').notEmpty().withMessage('Insert type'),
    check('niche').notEmpty().withMessage('Insert niche'),
    check('age').notEmpty().isNumeric().withMessage('Insert a valid age'),
    check('monthlyRevenue')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid revenue'),
    check('monthlyProfit')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid profit'),
    check('askingPrice')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid asking price'),
    check('description')
      .isLength({ min: 6 })
      .withMessage('Insert a valid description (6 characters)'),
    check('ownerId').notEmpty(),
  ],
  businessControllers.createBusiness,
);
router.patch(
  '/:bid',
  fileUpload.single('image'),
  [
    check('title')
      .isLength({ min: 3 })
      .withMessage('Title must have at least 3 characters'),
    check('type').notEmpty().withMessage('Insert type'),
    check('niche').notEmpty().withMessage('Insert niche'),
    check('age').notEmpty().isNumeric().withMessage('Insert a valid age'),
    check('monthlyRevenue')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid revenue'),
    check('monthlyProfit')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid profit'),
    check('askingPrice')
      .notEmpty()
      .isNumeric()
      .withMessage('Insert a valid asking price'),
    check('description')
      .isLength({ min: 6 })
      .withMessage('Insert a valid description (6 characters)'),
  ],
  businessControllers.updateBusinessById,
);
router.delete('/:bid', businessControllers.deleteBusinessById);

module.exports = router;
