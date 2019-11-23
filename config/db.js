const mongoose = require('mongoose');

module.exports = function() {
  mongoose.connect(process.env.DATABASE_CONNECTION_LINK, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  const dbConnection = mongoose.connection;

  dbConnection.on('error', () => {
    console.log('Error during DB connection'.red.bold);
    process.exit(1);
  });
  dbConnection.on('open', () => {
    console.log('Successfully connected to database'.green.bold);
  });
};