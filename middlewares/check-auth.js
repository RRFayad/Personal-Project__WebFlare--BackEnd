const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    if (!req.headers.authorization) {
      return next(new HttpError('Not Authenticated (No Token)', 403));
    }
    const token = req.headers.authorization.replace(/\s+/g, ' ').split(' ')[1];
    // Set header as Bearer TOKEN (regex for removing extra spaces in the header )
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
