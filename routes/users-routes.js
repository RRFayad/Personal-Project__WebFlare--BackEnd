const express = require('express');
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.get('/:uid', usersController.getUserById);
router.patch('/:uid', usersController.updateUserById);
router.patch('/update-password/:uid', usersController.updatePasswordById);
router.post('/signup', usersController.signUp);
router.post('/login', usersController.login);

module.exports = router;
