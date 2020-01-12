const httpStatus = require('http-status-codes');
const errorConstants = require('../constants/Error');

module.exports = (error, req, res, next) => {
  const errorType = error.constructor.name;
  switch (errorType) {
    case 'AppError':
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
        errors: error.errors,
        errorCode: error.errorCode,
      });
      break;
    case 'MongoError': {
      if (error.code === 11000) {
        const matches = error.errmsg.match(/(["'])(\\?.)*?\1/);
        res.status(httpStatus.BAD_REQUEST).json({
          status: 'fail',
          message: `Duplicate field value: ${matches[0]}. Please use another value`,
          errorCode: errorConstants.DUPLICATE_KEY,
          errors: {},
        });
      }
    }
      break;
    case 'MongooseError': {
      if (error.name === 'ValidationError') {
        const key = Object.keys(error.errors)[0];
        const mongooseError = error.errors[key];
        res.status(httpStatus.BAD_REQUEST).json({
          status: 'fail',
          message: mongooseError.message,
          errorCode: errorConstants.MONGOOSE_VALIDATION_ERROR,
          errors: {
            [mongooseError.path]: mongooseError.value,
          },
        });
      } else if (error.name === 'CastError') {
        res.status(httpStatus.BAD_REQUEST).json({
          status: 'fail',
          message: 'Failed to load data',
          errorCode: errorConstants.MONGOOSE_CAST_ERROR,
          errors: {
            [error.errors.path]: error.errors.value,
          },
        });
      } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Unknown mongoose error');
      }
    }
      break;
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      res.status(httpStatus.UNAUTHORIZED).json({
        status: 'fail',
        message: 'Invalid or expired token',
        errorCode: errorConstants.INVALID_OR_EXPIRED_TOKEN,
        errors: {
          token: req.headers.authorization.split(' ')[1],
        },
      });
      break;
    default : {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'fail',
        message: 'Internal server error',
        errorCode: errorConstants.INTERNAL_SERVER_ERROR,
        errors: {},
      });
    }
      break;
  }

  // MongoTimeoutError need to implement

  if (process.env.NODE_ENV === 'development') {
    console.log(error);
    console.log(errorType);
  }
};
