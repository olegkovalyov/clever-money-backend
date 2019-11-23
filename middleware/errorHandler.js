module.exports = (error, req, res, next) => {
  res.status(error.statusCode).json({
    'status': 'fail',
    'message': error.message,
    'errors' : error.errors,
  });
};