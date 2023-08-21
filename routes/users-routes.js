const express = require('express');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.get('/:uid', usersController.getUserById);
router.patch('/update-info/:uid', usersController.updateUserById);
router.patch('/update-password/:uid', usersController.updatePasswordById);
router.post('/signup', (req, res, next) => {});
router.post('/login', (req, res, next) => {});

module.exports = router;
