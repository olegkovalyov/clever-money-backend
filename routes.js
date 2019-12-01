const httpStatus = require('http-status-codes');
const errorHandler = require('./middleware/errorHandler');
const plansRouter = require('./routes/plans');
const usersRouter = require('./routes/users');

module.exports = (app) => {
  app.use('/api/v1/plans', plansRouter);
  app.use('/api/v1/users', usersRouter);

  // Bad routes
  app.all('*', (req, res) => {
    res.status(httpStatus.NOT_FOUND).end(httpStatus.getStatusText(httpStatus.NOT_FOUND));
  });

  // Global error handler
  app.use(errorHandler);
};