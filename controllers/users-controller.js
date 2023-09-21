const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const HttpError = require('../models/http-error');
const User = require('../models/user-model');
const Business = require('../models/business-model');

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

  const { name, imageUrl, profileUrl, country, email, description } = req.body;

  let user;
  try {
    user = await User.findById(userId, '-password');
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  if (!user) {
    return next(new HttpError(`User Id not found`, 404));
  }

  Object.assign(user, {
    name,
    imageUrl,
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

  const { name, imageUrl, profileUrl, country, email, password, description } =
    req.body;

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
    imageUrl:
      imageUrl ||
      'https://www.designerd.com.br/wp-content/uploads/2019/04/imagens-blogs-chamar-atencao-publico-fb.jpg',
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

  const newUserData = result.toObject({ gettes: true });

  delete newUserData.password;

  return res.status(201).json(newUserData);
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

  return res.json({ user: user.toObject({ getters: true }) });
};

exports.getUserById = getUserById;
exports.getUserByBusinessId = getUserByBusinessId;
exports.updateUserById = updateUserById;
exports.updatePasswordById = updatePasswordById;
exports.signUp = signUp;
exports.login = login;
