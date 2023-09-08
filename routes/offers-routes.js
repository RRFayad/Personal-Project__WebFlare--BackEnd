const express = require('express');
const offerControllers = require('../controllers/offers-controller');

const router = express.Router();

router.get('/user/sent/:uid', offerControllers.getOffersByUserId);
router.get('/user/received/:uid', offerControllers.getOffersByUserId);
router.post('/', offerControllers.createOffer);
router.patch('/:oid', (req, res, next) => {});
router.delete('/:oid', (req, res, next) => {});

module.exports = router;
