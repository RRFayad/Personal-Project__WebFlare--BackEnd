const express = require('express');
const { check } = require('express-validator');
const {
  fullNameValidator,
  passwordValidator,
  urlValidator,
} = require('../util/validators-and-formatters');
const usersController = require('../controllers/users-controller');
const fileUpload = require('../middlewares/file-upload');
const checkAuth = require('../middlewares/check-auth');

const router = express.Router();

router.get('/:uid', usersController.getUserById);
router.get('/business/:bid', usersController.getUserByBusinessId);
router.post(
  '/signup',

  fileUpload.single('image'),
  [
    check('name').custom(fullNameValidator).withMessage('Insert Full Name'),
    check('profileUrl')
      .optional()
      .custom(urlValidator)
      .withMessage('Profile Url not valid'),
    check('country').isLength({ min: 3 }).withMessage('Insert Country'),
    check('email').trim().isEmail().withMessage('Insert a valid e-mail'),
    check('password')
      .custom(passwordValidator)
      .withMessage(
        `Password must contain at least: 6 to 20 characters, Uppercase, Lowercase, Number and a Special Character`,
      ),
    check('description')
      .isLength({ min: 6 })
      .withMessage('Description must have at least 6 characters'),
  ],
  usersController.signUp,
);
router.post('/login', usersController.login);

router.patch(
  '/update-password/:uid',
  check('newPassword')
    .custom(passwordValidator)
    .withMessage(
      `Password must contain at least: 6 to 20 characters, Uppercase, Lowercase, Number and a Special Character`,
    ),
  usersController.updatePasswordById,
);

router.use(checkAuth);

router.patch(
  '/:uid',
  fileUpload.single('image'),
  [
    check('name').custom(fullNameValidator).withMessage('Insert Full Name'),
    check('imageUrl')
      .optional()
      .custom(urlValidator)
      .withMessage('Image Url not valid'),
    check('profileUrl')
      .optional()
      .custom(urlValidator)
      .withMessage('Profile Url not valid'),
    check('country').isLength({ min: 3 }).withMessage('Insert Country'),
    check('email').trim().isEmail().withMessage('Insert a valid e-mail'),
    check('description')
      .isLength({ min: 6 })
      .withMessage('Description must have at least 6 characters'),
  ],
  usersController.updateUserById,
);

module.exports = router;
