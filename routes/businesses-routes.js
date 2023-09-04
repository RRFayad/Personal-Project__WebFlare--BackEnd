const express = require('express');
const { check } = require('express-validator');

const businessControllers = require('../controllers/businesses-controller');

const router = express.Router();

router.get('/', businessControllers.getAllBusinesses);
router.get('/users/:uid', (req, res, next) => {});
router.get('/:bid', (req, res, next) => {});
router.post('/', businessControllers.createBusiness);
router.patch('/:bid', (req, res, next) => {});
router.delete('/:bid', (req, res, next) => {});

module.exports = router;
