const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const colors = require('colors');
const mongoose = require('mongoose');

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

/*
(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION_LINK, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to database'.green.bold);
  } catch (e) {
    console.log('Error during DB connection'.red.bold);
    process.exit(1);
  }
})();
 */

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const plansRouter = require('./routes/plans');
app.use('/api/v1/plans', plansRouter);

//Running server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server started'.blue.bold));