const AppError = require('./appError');
const httpStatus = require('http-status-codes');

const handleValidationError = (error, next) => {
  const errors = Object.values(error.errors);
  let message = error._message;
  let errorDetails = {};
  errors.forEach(element => {
    errorDetails[`${element.path}`] = element.value ? element.value : null;
  });
  next(new AppError(httpStatus.BAD_REQUEST, message, errorDetails));
};

const handleDuplicateFieldError = (error, next) => {
  const matches = error.errmsg.match(/(["'])(\\?.)*?\1/);
  let message = `Duplicate field value: ${matches[0]}. Please use another value`;
  next(new AppError(httpStatus.BAD_REQUEST, message));
};

const handleCastError = (error, next) => {
  let message = 'Failed to load data';
  let errorDetails = {};
  errorDetails[`${error.path}`] = error.value;
  next(new AppError(httpStatus.BAD_REQUEST, message, errorDetails));
};

module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      switch (error.name) {
        case 'MongoError':
          if (error.code === 11000) {
            handleDuplicateFieldError(error, next);
          }
          break;
        case 'ValidationError':
          handleValidationError(error, next);
          break;
        case 'CastError':
          handleCastError(error, next);
          break;
      }
      res.send(error);
    }
  };
};