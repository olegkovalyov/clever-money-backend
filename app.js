const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});
const colors = require('colors');
const cors = require('cors');
const {startServer, stopServer} = require('./utils/server');

require('./utils/db')();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

require('./routes')(app);

//Running server
startServer(app);

