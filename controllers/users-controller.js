const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const HttpError = require('../models/http-error');
const User = require('../models/user-model');

const { users } = require('../util/DUMMY_DATA');

const getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const user = users.find(item => userId === item.id);

  if (!user) {
    const error = new Error('Could not find user');
    error.status = 404;
    return next(error);
  }
  delete user.password;
  return res.json(user);
};

const updateUserById = (req, res, next) => {
  const userId = req.params.uid;
  const { country, description, email, imageUrl, linkedinUrl, name } = req.body;
  const userIndex = users.findIndex(item => userId === item.id);

  if (userIndex === -1) {
    const error = new Error('Could not find user');
    error.status = 404;
    return next(error);
  }

  const newUserData = {
    ...users[userIndex],
    country,
    description,
    email,
    imageUrl,
    linkedinUrl,
    name,
  };

  users.splice(userIndex, 1, { ...newUserData });
  delete newUserData.password;
  return res.json(newUserData);
};

const updatePasswordById = (req, res, next) => {
  const userId = req.params.uid;
  const { password, newPassword } = req.body;
  const userIndex = users.findIndex(
    item =>
      userId === item.id &&
      (bcrypt.compareSync(password, item.password) ||
        password === item.password),
  );

  if (userIndex === -1) {
    const error = new Error('Wrong Passoword');
    error.status = 404;
    return next(error);
  }

  const newUserData = {
    ...users[userIndex],
    password: bcrypt.hashSync(newPassword, 12),
  };

  users.splice(userIndex, 1, { ...newUserData });
  // delete newUserData.password;
  return res.json(newUserData);
};

const signUp = async (req, res, next) => {
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
    imageUrl,
    profileUrl,
    password: hashedPassword,
    description,
    businesses: [],
    offers: [],
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

const login = (req, res, next) => {
  const { email, password } = req.body;

  const userData = users.find(
    user => user.email === email && bcrypt.compareSync(password, user.password),
  );

  if (!userData) {
    const error = new Error('Invalid Credentials');
    error.status = 404;
    return next(error);
  }

  return res.json(userData);
};

exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.updatePasswordById = updatePasswordById;
exports.signUp = signUp;
exports.login = login;
