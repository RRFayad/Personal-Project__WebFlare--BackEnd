const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; // Set header as Bearer TOKEN
    if (!token) {
      return next(new HttpError('Not Authenticated', 403));
    }
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.decodedTokenData = { userId };
    return next();
  } catch (err) {
    return next(new HttpError(`Authentocation Failed - ${err}`, 403));
  }
};
