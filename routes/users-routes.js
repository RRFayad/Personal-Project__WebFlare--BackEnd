const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');

const router = express.Router();

router.get('/:uid', usersController.getUserById);
router.post(
  '/signup',
  check('password')
    .isLength({ min: 6, max: 20 })
    .custom(
      value =>
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[!@#$%^&*]/.test(value),
    )
    .withMessage(
      `Password must contain at least: 6 to 20 characters, Uppercase, Lowercase, Number and a Special Character`,
    ),
  usersController.signUp,
);
router.post('/login', usersController.login);
router.patch('/:uid', usersController.updateUserById);
router.patch(
  '/update-password/:uid',
  check('newPassword')
    .isLength({ min: 6, max: 20 })
    .custom(
      value =>
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[!@#$%^&*]/.test(value),
    )
    .withMessage(
      `Password must contain at least: 6 to 20 characters, Uppercase, Lowercase, Number and a Special Character`,
    ),
  usersController.updatePasswordById,
);

module.exports = router;
