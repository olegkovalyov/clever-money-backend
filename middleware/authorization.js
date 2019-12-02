const httpStatus = require('http-status-codes');
const AppError = require('../classes/AppError');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../models/User');
const errorConstants = require('../constants/Error');

module.exports = async (req, res, next) => {
  let token;
  if (req.headers.authorization
      && req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    let error = new AppError();
    error.statusCode = httpStatus.UNAUTHORIZED;
    error.errorCode = errorConstants.INVALID_OR_EXPIRED_TOKEN;
    error.message = 'Invalid or expired token';
    error.errors = {token: null};
    return next(error);
  }
  try {
    const decodedData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);
    if (!user
        || user.changedPasswordAfter(decodedData.iat)
    ) {
      let error = new AppError();
      error.statusCode = httpStatus.UNAUTHORIZED;
      error.message = 'Invalid or expired token';
      error.errorCode = errorConstants.INVALID_OR_EXPIRED_TOKEN;
      error.errors = {token: token};
      return next(error);
    }

  } catch (error) {
    return next(error);
  }
  next();
};