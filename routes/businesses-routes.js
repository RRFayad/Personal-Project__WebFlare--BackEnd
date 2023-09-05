const express = require('express');
const { check } = require('express-validator');

const businessControllers = require('../controllers/businesses-controller');

const router = express.Router();

router.get('/', businessControllers.getAllBusinesses);
router.get('/user/:uid', businessControllers.getBusinessesByUserId);
router.get('/:bid', businessControllers.getBusinessById);
router.post('/', businessControllers.createBusiness);
router.patch('/:bid', businessControllers.updateBusinessById);
router.delete('/:bid', businessControllers.deleteBusinessById);

module.exports = router;
