const express = require('express');
const { check } = require('express-validator');
const offerControllers = require('../controllers/offers-controller');

const router = express.Router();

router.get('/user/:uid', offerControllers.getOffersByUserId);
router.get('/:oid', offerControllers.getOfferById);
router.post(
  '/',
  [
    check('offerValue')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('Offer value not valid'),
    check('message')
      .isLength({ min: 6 })
      .withMessage('Description not valid (min 6 characters)'),
  ],
  offerControllers.createOffer,
);
router.patch('/:oid', offerControllers.acceptOfferById);
router.delete('/:oid', offerControllers.deleteOfferById);

module.exports = router;
