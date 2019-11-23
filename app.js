const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});
const colors = require('colors');
const cors = require('cors');

require('./config/db')();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

require('./routes')(app);

//Running server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server started'.blue.bold));