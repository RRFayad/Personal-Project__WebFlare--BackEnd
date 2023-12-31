const fs = require('fs');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../models/http-error');
const User = require('../models/user-model');
const Business = require('../models/business-model');

const defaultImagePath = 'images/users/00_default-user-image-owl.jpg';

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId, '-password');
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }
  if (!user) {
    return next(new HttpError(`User Id not found`, 404));
  }

  return res.json({ user: user.toObject({ getters: true }) });
};

const getUserByBusinessId = async (req, res, next) => {
  const businessId = req.params.bid;

  let user;
  try {
    const populatedBusiness =
      await Business.findById(businessId).populate('owner');
    user = populatedBusiness.owner;
  } catch (error) {
    return next(new HttpError(`Saving business failed - "${error}"`, 500));
  }

  return res.json({
    user: user.toObject({ getters: true }),
  });
};

const updateUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  const userId = req.params.uid;

  if (userId !== req.decodedTokenData.userId) {
    return next(new HttpError('User not authorized', 403));
  }

  const { name, profileUrl, country, email, description } = req.body;

  let user;
  let currentImage;
  try {
    user = await User.findById(userId, '-password');
    currentImage = user.image;
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  if (!user) {
    return next(new HttpError(`User Id not found`, 404));
  }

  let updatedImage;
  if (req.file) {
    updatedImage = req.file.path;
  } else {
    updatedImage = user.image;
  }

  Object.assign(user, {
    name,
    image: updatedImage,
    profileUrl,
    country,
    email,
    description,
  });

  let updatedUser;
  try {
    updatedUser = await user.save();
  } catch (error) {
    return next(new HttpError(`Could not save user data - "${error}"`, 500));
  }

  if (req.file && currentImage !== defaultImagePath) {
    fs.unlink(currentImage, err => console.log(err));
  }
  return res.json({ user: updatedUser.toObject({ getters: true }) });
};

const updatePasswordById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  const userId = req.params.uid;
  const { password, newPassword } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  if (!user) {
    return next(new HttpError(`User Id not found`, 404));
  }

  if (bcrypt.compareSync(password, user.password)) {
    Object.assign(user, {
      password: await bcrypt.hash(newPassword, 12),
    });
  } else {
    return next(new HttpError(`Password did not match`, 401));
  }

  try {
    await user.save();
  } catch (error) {
    return next(new HttpError(`Could not save user data - "${error}"`, 500));
  }

  return res.json({ message: 'Password updated Successfully' });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  const { name, profileUrl, country, email, password, description } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError(`Could not check e-mail - "${err}"`, 500));
  }

  if (existingUser) {
    return next(new HttpError('E-mail already registered', 422));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    name,
    email,
    country,
    image: req.file ? req.file.path : defaultImagePath,
    profileUrl,
    password: hashedPassword,
    description,
    businesses: [],
    sentOffers: [],
    receivedOffers: [],
  });

  let result;
  try {
    result = await newUser.save();
  } catch (error) {
    return next(new HttpError(`Sign Up failed - "${error}"`, 500));
  }

  const newUserData = result.toObject({ getters: true });

  delete newUserData.password;

  const token = {};
  try {
    token.value = jwt.sign({ userId: newUserData.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const decodedToken = jwt.decode(token.value);
    token.expirationTime = decodedToken.exp * 1000;
  } catch (err) {
    return next(new HttpError(`Sign Up failed - "${err}"`, 500));
  }

  return res.status(201).json({ user: newUserData, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new HttpError(`Invalid Credentials`, 401));
  }

  delete user.password;

  const token = {};
  try {
    token.value = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const decodedToken = jwt.decode(token.value);
    token.expirationTime = decodedToken.exp * 1000;
  } catch (err) {
    return next(new HttpError(`Sign Up failed - "${err}"`, 500));
  }

  return res.json({
    user: user.toObject({ getters: true }),
    token,
  });
};

exports.getUserById = getUserById;
exports.getUserByBusinessId = getUserByBusinessId;
exports.updateUserById = updateUserById;
exports.updatePasswordById = updatePasswordById;
exports.signUp = signUp;
exports.login = login;
